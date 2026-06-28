import { v4 } from "uuid";
import path from "path";
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

let assetMap: Map<Shared.Asset.AssetId, Shared.Asset.Asset> = new Map();
let potentialAssets: Shared.Asset.Asset[] = [];

let assetRescanNotifyFunc: Shared.Asset.AssetRescanNotifyFunc | undefined = undefined;
export const AssetRepositorySystem = {
    initSystem(notifyFunc?: Shared.Asset.AssetRescanNotifyFunc): boolean {
        assetRescanNotifyFunc = notifyFunc;
        FileBrowserSystem.getIndexDoneEvent()?.on((payload) => {
            AssetRepositorySystem.rescan(payload);
        });
        return true;
    },

    getAssetMap(): Readonly<Map<Shared.Asset.AssetId, Shared.Asset.Asset>> {
        return assetMap;
    },

    async rescan(index?: Map<string, Shared.FileBrowser.FileEntry[]>): Promise<void> {
        Logger.info(Shared.Log.Channel.Assets, "Rescanning assets...");

        const fileIndex = index ?? FileBrowserSystem.getIndex();
        const { millis } = await Shared.Timing.timeMillisAsync(async () => {
            assetMap = await _buildAssets(fileIndex);
            potentialAssets = _detectPotentialAssets(fileIndex.keys());
        });

        Logger.info(Shared.Log.Channel.Assets, "Asset rescan done. Found", assetMap.size, "assets in", millis, "ms");
        assetRescanNotifyFunc?.({ assets: assetMap, potentialAssets, totalTimeMillis: millis });

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
            mcaFilePath = path.join(mcaBasePath, `${mcaFileName}.mca`);
        } while (existsSync(path.join(ConfigSystem.getAppConfig().rootPath, mcaFilePath)));

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
        const absoluteMcaPath = path.join(ConfigSystem.getAppConfig().rootPath, mcaPath);
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

async function _buildAssets(
    index: Map<string, Shared.FileBrowser.FileEntry[]>,
): Promise<Map<Shared.Asset.AssetId, Shared.Asset.Asset>> {
    const assets = new Map<Shared.Asset.AssetId, Shared.Asset.Asset>();
    const rootPath = ConfigSystem.getAppConfig().rootPath;

    for (const filePaths of index.values()) {
        for (const filePath of filePaths) {
            let definition: Shared.Asset.AssetDef | undefined;
            let isTransient = false;

            if (Shared.Asset.isMcaFile(filePath.path)) {
                definition = await _readMcaFile(filePath.path, rootPath);
            } else if (Shared.Asset.isQcFile(filePath.path)) {
                definition = await _readQcFile(filePath.path, rootPath);
                isTransient = true;
            } else {
                continue;
            }

            if (definition === undefined) {
                Logger.warning(Shared.Log.Channel.Assets, "Asset", filePath, "is invalid and will be ignored");
                continue;
            }

            const duplicateOther = assets.get(definition.id);
            if (duplicateOther !== undefined) {
                Logger.warning(
                    Shared.Log.Channel.Assets,
                    "Asset definition file",
                    filePath,
                    "has the same id as",
                    duplicateOther.def.id,
                    definition.id,
                    "and will be ignored",
                );
                continue;
            }

            const asset: Shared.Asset.Asset = {
                def: definition,
                defFilePath: Shared.SourceFs.forwardSlashed(filePath.path),
                isTransient,
            };
            assets.set(definition.id, asset);
        }
    }

    return assets;
}

function _detectPotentialAssets(contentTree: Iterable<string>): Shared.Asset.Asset[] {
    const assets: Shared.Asset.Asset[] = [];
    for (const file of contentTree) {
        const isTexture = Shared.FileEndings.isTextureFileEnding(path.extname(file));
        if (isTexture) {
            if (!file.includes("_hr")) continue;
            if (AssetRepositorySystem.getAssetFromFile(file) !== undefined) continue;

            assets.push({
                defFilePath: file,
                def: createTextureAssetDefinition(file),
            });
        }
    }
    return assets;
}

async function _readMcaFile(filePath: string, fileRootPath: string): Promise<Shared.Asset.AssetDef | undefined> {
    const fullPath = path.join(fileRootPath, filePath);
    const text = await fs.readFile(fullPath, "utf-8");
    const unk = JSON.parse(text);

    if (unk.type === undefined) {
        Logger.warning(Shared.Log.Channel.Assets, "Asset definition file", filePath, "has no type");
        return undefined;
    }
    if (unk.id === undefined) {
        Logger.warning(Shared.Log.Channel.Assets, "Asset definition file", filePath, "has no id");
        return undefined;
    }
    if (!Shared.Asset.isValidAssetType(unk.type)) {
        Logger.warning(Shared.Log.Channel.Assets, "Asset definition file", filePath, "has invalid type ", unk.type);
        return undefined;
    }

    return unk;
}

async function _readQcFile(filePath: string, fileRootPath: string): Promise<Shared.Asset.AssetDef | undefined> {
    return undefined;
}
