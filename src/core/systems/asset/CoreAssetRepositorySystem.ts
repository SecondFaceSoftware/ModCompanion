import { v4 } from "uuid";
import * as pathe from "pathe";
import fs from "fs/promises";
import { ConfigSystem } from "../CoreConfigSystem.js";
import { AssetCreationInferResults, inferAssetCreationType } from "./CoreAssetCreateInferType.js";
import { createUnknownAssetDefinition } from "./CoreAssetCreateUnknown.js";
import { createTextureAssetDefinition } from "./CoreAssetCreateTexture.js";
import { ConversionChecksumSystem } from "../conversion/CoreConversionChecksumSystem.js";
import { ConversionAgentSystem } from "../conversion/CoreConversionAgentSystem.js";
import { existsSync } from "fs";
import { Logger } from "../CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import { FileBrowserSystem } from "../CoreFileBrowserSystem.js";
import { WorkerSystem } from "../CoreWorkerSystem.js";
import { TaskSystem } from "../CoreTaskSystem.js";

let assetMap: Shared.Asset.AssetMap = new Map();

let assetRescanNotifyFunc: Shared.Asset.AssetRescanNotifyFunc | undefined = undefined;
export const AssetRepositorySystem = {
    initSystem(funcs?: { scanFunc?: Shared.Asset.AssetRescanNotifyFunc }): boolean {
        assetRescanNotifyFunc = funcs?.scanFunc;
        FileBrowserSystem.getIndexDoneEvent()?.on((payload) => {
            AssetRepositorySystem.scan(payload);
        });
        return true;
    },

    getAssetMap(): Readonly<Map<Shared.Asset.AssetId, Shared.Asset.Asset>> {
        return assetMap;
    },

    async scan(fileIndex?: Map<string, Shared.FileBrowser.FileEntry[]>): Promise<void> {
        Logger.info(Shared.Log.Channel.Assets, "Scanning assets...");

        const index = fileIndex ?? FileBrowserSystem.getIndex();

        const { millis } = await Shared.Timing.timeMillisAsync(async () => {
            TaskSystem.startTask({ taskId: Shared.Task.TaskIds.AssetScan, quantityGoal: index.size });
            const result = await WorkerSystem.createResultWorker(
                Shared.Workers.WorkerFile.AssetScanner,
                { index },
                (payload) => {
                    TaskSystem.updateTask(Shared.Task.TaskIds.AssetScan, payload.progressNow);
                },
            );
            TaskSystem.endTask(Shared.Task.TaskIds.AssetScan);

            if (result) {
                assetMap = result;
            } else {
                Logger.warning(Shared.Log.Channel.Assets, "Failed to scan assets");
            }
        });

        Logger.info(Shared.Log.Channel.Assets, "Asset scan done. Found", assetMap.size, "assets in", millis, "ms");
        assetRescanNotifyFunc?.({ assets: assetMap, totalTimeMillis: millis });

        await ConversionChecksumSystem.initChecksums(assetMap);
        await ConversionAgentSystem.initStates(assetMap);
    },

    generateAssetId(): string {
        return v4();
    },

    async createAssetsFromFiles(primaryFile: string, otherFiles: string[]): Promise<Shared.Asset.Asset[] | undefined> {
        const files = [primaryFile, ...otherFiles];
        if (files.length === 0) return undefined;

        const inferredType = inferAssetCreationType(files);

        Logger.info(Shared.Log.Channel.Generic, "Inferred asset type", inferredType);
        if (inferredType === AssetCreationInferResults.Unknown) {
            const def = createUnknownAssetDefinition(primaryFile, otherFiles);
            const mca = primaryFile + Shared.Asset.McaFileExt;

            const newAsset = await AssetRepositorySystem.writeAssetDef(def, mca);
            assetMap.set(def.id, newAsset);
            return [newAsset];
        }

        if (inferredType === AssetCreationInferResults.Texture) {
            const newAssets: Shared.Asset.Asset[] = [];
            for (const file of files) {
                const def = createTextureAssetDefinition(file);
                const mca = file + Shared.Asset.McaFileExt;

                const newAsset = await AssetRepositorySystem.writeAssetDef(def, mca);
                assetMap.set(def.id, newAsset);
                newAssets.push(newAsset);
            }
            return newAssets;
        }

        return undefined;
    },

    createEmptyAsset(mcaBasePath: string): Promise<Shared.Asset.Asset> {
        let mcaFilePath = "";
        let mcaFileName = "";

        Logger.debug(Shared.Log.Channel.Generic, mcaBasePath);

        let i = 0;
        do {
            mcaFileName = `new_asset_${i++}`;
            mcaFilePath = pathe.join(mcaBasePath, `${mcaFileName}.mca`);
        } while (existsSync(pathe.join(ConfigSystem.getAppConfig().rootPath, mcaFilePath)));

        return AssetRepositorySystem.writeAssetDef(
            {
                id: AssetRepositorySystem.generateAssetId(),
                displayName: mcaFileName,
                type: Shared.Asset.Types.Unknown,
            },
            mcaFilePath,
        );
    },

    async writeAssetDef(assetDef: Shared.Asset.AssetDef, mcaPath: string): Promise<Shared.Asset.Asset> {
        const absoluteMcaPath = pathe.join(ConfigSystem.getAppConfig().rootPath, mcaPath);
        const payload = JSON.stringify(assetDef, undefined, 2);
        Logger.info(Shared.Log.Channel.Generic, "Writing asset", mcaPath, assetDef);
        await fs.writeFile(absoluteMcaPath, payload);

        const asset = { defFilePath: mcaPath, def: assetDef };
        assetMap.set(assetDef.id, asset);
        return asset;
    },

    getAssetFromFile(filePath: string): Shared.Asset.Asset | undefined {
        for (const asset of assetMap.values()) {
            if (asset.def.gameFiles?.includes(filePath)) return asset;
            if (asset.def.contentFiles?.includes(filePath)) return asset;
            if (asset.defFilePath === filePath) return asset;
        }

        return undefined;
    },

    getAssetFromFiles(filePaths: string[]): Shared.Asset.Asset | undefined {
        for (const asset of assetMap.values()) {
            for (const filePath of filePaths) {
                if (asset.def.gameFiles?.includes(filePath)) return asset;
                if (asset.def.contentFiles?.includes(filePath)) return asset;
            }
        }

        return undefined;
    },

    getAssetsFromMcaFiles(mcaFilePaths: string[]): Shared.Asset.Asset[] {
        const result: Shared.Asset.Asset[] = [];
        for (const asset of assetMap.values()) {
            for (const filePath of mcaFilePaths) {
                if (asset.defFilePath === filePath) result.push(asset);
            }
        }

        return result;
    },

    getAssetFromId(hash: Shared.Asset.AssetId): Shared.Asset.Asset | undefined {
        return assetMap.get(hash);
    },

    async deleteAssetDef(assetId: Shared.Asset.AssetId): Promise<boolean> {
        const asset = assetMap.get(assetId);
        if (!asset) return false;

        if (!asset.defFilePath) return false;

        const exists = existsSync(asset.defFilePath);
        if (!exists) return false;

        const stat = await fs.stat(asset.defFilePath);
        if (!stat.isFile()) return false;

        try {
            await fs.rm(asset.defFilePath);
            return true;
        } catch (e) {
            Logger.warning(Shared.Log.Channel.Generic, "Failed to delete asset", assetId, e);
            return false;
        }
    },
};
