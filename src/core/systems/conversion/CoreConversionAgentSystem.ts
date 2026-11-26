import fs from "fs/promises";
import { existsSync } from "fs";
import { TextureConverter } from "../../helpers/converter/CoreTextureConverter.js";
import { ModelConverter } from "../../helpers/converter/CoreModelConverter.js";
import { makeContentPathAbsolute, makeGamePathAbsolute } from "../../helpers/CoreSourceFs.js";
import { ConversionChecksumSystem } from "./CoreConversionChecksumSystem.js";
import { ConversionEventSystem } from "./CoreConversionEventSystem.js";
import { AssetWatcherSystem } from "../CoreAssetWatcherSystem.js";
import { Logger } from "../CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import { AssetRepositorySystem } from "../asset/CoreAssetRepositorySystem.js";
import { ConfigSystem } from "../CoreConfigSystem.js";
import * as pathe from "pathe";

const MAX_PARALLEL_JOBS = 1;
const CONVERSION_INTERVAL_MS = 10;

let lastChangeTime: Date | undefined = undefined;

type JobResult = string | undefined;
const conversionJobs: Map<Shared.Asset.AssetId, Promise<JobResult>> = new Map();

let agentInterval: NodeJS.Timeout | undefined;
const conversionsMap: Map<Shared.Asset.AssetId, Shared.Conversion.State> = new Map();

let notifyFunc: Shared.Conversion.UpdateNotifyFunc | undefined = undefined;

export const ConversionAgentSystem = {
    initSystem(func?: Shared.Conversion.UpdateNotifyFunc): boolean {
        notifyFunc = func;
        return true;
    },
    startAgent(): void {
        if (!agentInterval) {
            agentInterval = setInterval(_runAgent, CONVERSION_INTERVAL_MS);
        }
    },
    stopAgent(): void {
        if (agentInterval) {
            clearInterval(agentInterval);
        }
    },
    async runAndConvertUntilItIsDone(
        force?: boolean,
        convStartNotifyFunc?: Shared.Conversion.ConversionStartNotifyFunc,
    ): Promise<void> {
        for (const [assetId, state] of conversionsMap.entries()) {
            if (force || state === Shared.Conversion.State.Pending || state === Shared.Conversion.State.PendingForced) {
                if (force) {
                    _setState(assetId, Shared.Conversion.State.PendingForced);
                }
                convStartNotifyFunc?.(assetId);
                try {
                    await _startConversion(assetId);
                } catch (e) {
                    Logger.warning(Shared.Log.Channel.ConversionAgent, "Conversion failed", assetId);
                }
            }
        }
    },
    getConversionsMap(): Map<Shared.Asset.AssetId, Shared.Conversion.State> {
        return conversionsMap;
    },
    enqueue(assetId: string, force: boolean = false): void {
        if (_getState(assetId) === Shared.Conversion.State.InProgress) {
            return;
        }

        if (force) {
            _setState(assetId, Shared.Conversion.State.PendingForced, true);
        } else {
            _setState(assetId, Shared.Conversion.State.Pending, true);
        }
    },
    enqueueAll(): void {
        for (const assetId of AssetRepositorySystem.getAssetMap().keys()) {
            ConversionAgentSystem.enqueue(assetId, true);
        }
    },
    async initStates(map: Map<Shared.Asset.AssetId, Shared.Asset.Asset>) {
        for (const asset of map.values()) {
            if (!_isConvertible(asset.def)) {
                _setState(asset.def.id, Shared.Conversion.State.NotConvertible);
                continue;
            }

            if (!_shouldAutoConvert(asset)) {
                _setState(asset.def.id, Shared.Conversion.State.NoChange);
                continue;
            }

            const valid = _isValidAsset(asset.def);
            const contentExists = _areContentFilesValid(asset.def);
            if (!valid || !contentExists) {
                _setState(asset.def.id, Shared.Conversion.State.Invalid);
                continue;
            }

            const stale = await _isAssetStale(asset.def);
            if (stale) {
                ConversionAgentSystem.enqueue(asset.def.id);
            } else {
                _setState(asset.def.id, Shared.Conversion.State.NoChange);
            }
        }
    },
};

async function _runAgent(): Promise<void> {
    const assetsToConvert = _getAssetsToConvert();
    if (assetsToConvert.assets.length > 0) {
        // Logger.info(Shared.Log.Channel.ConversionAgent, `Converting ${assetsToConvert.length} asset`);
        const promises: Promise<string | undefined>[] = [];
        for (const assetId of assetsToConvert.assets) {
            promises.push(_startConversion(assetId));
        }

        await Promise.allSettled(promises);
    }

    const event: Shared.Conversion.UpdateEvent = {
        conversions: conversionsMap,
        conversionsLastChangeTime: lastChangeTime,
        events: ConversionEventSystem.conversionEvents,
        eventsLastChangeTime: ConversionEventSystem.lastChangeTime,
        summary: {
            currentStatus: conversionJobs.size === 0 ? "idle" : "working",
            totalSum: ConversionEventSystem.conversionEvents.length,
            queueLength: assetsToConvert.totalAssetsToConvertCount + conversionJobs.size,
        },
    };

    notifyFunc?.(event);
}

function _shouldAutoConvert(asset: Shared.Asset.Asset): boolean {
    const autoConvertPaths = ConfigSystem.getAppConfig().conversionAgent?.autoConvertPaths;
    if (!autoConvertPaths) return true;
    if (asset.defFilePath === undefined) return false;

    return autoConvertPaths.some((p) => asset.defFilePath!.startsWith(p));
}

function _getAssetsToConvert(): { assets: Shared.Asset.AssetId[]; totalAssetsToConvertCount: number } {
    let freeJobsCount = MAX_PARALLEL_JOBS - conversionJobs.size;
    let queueLength = 0;

    const assets: Shared.Asset.AssetId[] = [];

    for (const [assetId, state] of conversionsMap.entries()) {
        const alreadyAdded = conversionJobs.has(assetId);
        const isPending = state === Shared.Conversion.State.Pending || state === Shared.Conversion.State.PendingForced;
        if (isPending && !alreadyAdded) {
            queueLength++;
            if (freeJobsCount > 0) {
                assets.push(assetId);
                freeJobsCount--;
            }
        }
    }

    return { assets, totalAssetsToConvertCount: queueLength };
}

async function _startConversion(id: Shared.Asset.AssetId): Promise<string | undefined> {
    const asset = AssetRepositorySystem.getAssetFromId(id);
    if (!asset) {
        _setState(id, Shared.Conversion.State.Unknown);
        return undefined;
    }

    if (!_isConvertible(asset.def)) {
        return undefined;
    }

    const previousState = _getState(id);
    const force = previousState === Shared.Conversion.State.PendingForced;
    if (!force && !_shouldAutoConvert(asset)) {
        _setState(id, Shared.Conversion.State.NoChange);
        return undefined;
    }

    const startTime = new Date();
    ConversionEventSystem.pushNewEvent(asset.def.id, startTime, previousState);
    _setState(id, Shared.Conversion.State.InProgress);

    if (!_isValidAsset(asset.def) || !_areContentFilesValid(asset.def)) {
        _setState(id, Shared.Conversion.State.Invalid);
        return undefined;
    }

    if (!force) {
        // The purpose of checksums is to avoid unnecessary conversions when the file was touched without contents changing
        // Blender source tools for example reexports all model files in bulk but only one may have its contents updated
        const hasChanged = await ConversionChecksumSystem.hasChanged(asset.def);
        if (!hasChanged) {
            const isStale = await _isAssetStale(asset.def);
            if (!isStale) {
                _setState(id, Shared.Conversion.State.NoChange);
                return undefined;
            }
        }
    }

    Logger.info(Shared.Log.Channel.ConversionAgent, "Converting asset", asset.def.displayName, asset.def.id);
    const timeoutPromise = _convertAsset(asset.def)
        .then((log) => {
            const newState = log === undefined ? Shared.Conversion.State.Failed : Shared.Conversion.State.Finished;
            _onJobPromiseDone(id, newState, log);
            _touchAsset(asset.def);
            return log;
        })
        .catch((log: string | undefined) => {
            Logger.info(Shared.Log.Channel.ConversionAgent, log);
            _onJobPromiseDone(id, Shared.Conversion.State.Failed, log);
            return log;
        });
    conversionJobs.set(id, timeoutPromise);
    return timeoutPromise;
}

async function _convertAsset(asset: Shared.Asset.AssetDef): Promise<string | undefined> {
    switch (asset.type) {
        case Shared.Asset.Types.Texture:
            return TextureConverter.convert(asset as Shared.Asset.TextureAssetDef);
        case Shared.Asset.Types.Model:
            return ModelConverter.convert(asset as Shared.Asset.ModelAssetDef);
        default:
            return undefined;
    }
}

function _isValidAsset(asset: Shared.Asset.AssetDef): boolean {
    switch (asset.type) {
        case Shared.Asset.Types.Texture:
            return TextureConverter.isValid(asset as Shared.Asset.TextureAssetDef);
        case Shared.Asset.Types.Model:
            return ModelConverter.getQcFile(asset as Shared.Asset.ModelAssetDef) !== undefined;
        default:
            return false;
    }
}

function _isConvertible(asset: Shared.Asset.AssetDef): boolean {
    if (asset.type === Shared.Asset.Types.Texture) return true;
    if (asset.type === Shared.Asset.Types.Model) return true;

    return false;
}

function _areContentFilesValid(assetDef: Shared.Asset.AssetDef): boolean {
    if (assetDef.type === Shared.Asset.Types.Texture) {
        return _doAllContentFilesExist(assetDef);
    }

    // only check if the qc file exists for models. let studiomdl find out if the asset is correct
    if (Shared.Asset.isModelAssetDef(assetDef)) {
        const qcFile = ModelConverter.getQcFile(assetDef);
        if (!qcFile) return false;
        const fullQcFile = pathe.join(ConfigSystem.getAppConfig().contentPath, qcFile);
        return existsSync(fullQcFile);
    }

    return true;
}

function _doAllContentFilesExist(assetDef: Shared.Asset.AssetDef): boolean {
    if (assetDef.contentFiles === undefined) return false;
    for (const c of assetDef.contentFiles) {
        const absPath = makeContentPathAbsolute(c);
        if (!existsSync(absPath)) return false;
    }
    return true;
}

function _onJobPromiseDone(id: Shared.Asset.AssetId, stateAfter: Shared.Conversion.State, log: string | undefined) {
    conversionJobs.delete(id);
    _setState(id, stateAfter);
    ConversionEventSystem.updateLatestEvent(id, (event) => {
        event.endTime = new Date();
        if (log) {
            event.log += log;
        }
    });
}

function _setState(id: Shared.Asset.AssetId, state: Shared.Conversion.State, noHistory = false) {
    lastChangeTime = new Date();
    conversionsMap.set(id, state);

    if (!noHistory) {
        ConversionEventSystem.updateLatestEvent(id, (event) => {
            event.stateHistory.push(state);
        });
    }
}

function _getState(id: Shared.Asset.AssetId) {
    return conversionsMap.get(id) ?? Shared.Conversion.State.Unknown;
}

async function _touchAsset(asset: Shared.Asset.AssetDef) {
    if (asset.contentFiles === undefined || asset.contentFiles.length === 0) return false;
    if (asset.gameFiles === undefined || asset.gameFiles.length === 0) return false;

    const time = Math.floor(Date.now() / 1000);
    for (const contentFile of asset.contentFiles) {
        const p = makeContentPathAbsolute(contentFile);

        AssetWatcherSystem.ignore(p);
        try {
            await fs.utimes(p, time, time);
        } catch (e) {
            Logger.warning(Shared.Log.Channel.ConversionAgent, "Failed to set change date of", p);
        }
    }

    for (const gameFile of asset.gameFiles) {
        const p = makeGamePathAbsolute(gameFile);

        AssetWatcherSystem.ignore(p);
        try {
            await fs.utimes(p, time, time);
        } catch (e) {
            Logger.warning(Shared.Log.Channel.ConversionAgent, "Failed to set change date of", p);
        }
    }
}

async function _isAssetStale(asset: Shared.Asset.AssetDef): Promise<boolean> {
    if (asset.contentFiles === undefined || asset.contentFiles.length === 0) return false;
    if (asset.gameFiles === undefined || asset.gameFiles.length === 0) return false;

    const contentTimePromises = asset.contentFiles.map(makeContentPathAbsolute).map(_getModifiedTime);
    const gameTimePromises = asset.gameFiles.map(makeGamePathAbsolute).map(_getModifiedTime);

    const contentTimes = await Promise.all(contentTimePromises);
    const gameTimes = await Promise.all(gameTimePromises);

    const allTimes = [...contentTimes, ...gameTimes];
    const timesSet = new Set(allTimes);

    const isStale = timesSet.size !== 1;
    return isStale;
}

async function _getModifiedTime(filePath: string): Promise<number | undefined> {
    try {
        const stat = await fs.stat(filePath);
        return stat.mtimeMs;
    } catch {
        // We don't care about the error. If stat fails it probably doesn't exist which is an expected state
        return undefined;
    }
}
