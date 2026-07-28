import * as Shared from "mod_companion_shared";
import * as pathe from "pathe";
import fs from "node:fs/promises";
import * as sourcelib from "sourcelib";
import { useWorkerThreadData } from "../helpers/CoreWorkerHelper.js";
import { parentPort } from "worker_threads";

const data = useWorkerThreadData<typeof Shared.Workers.WorkerFile.AssetScanner>();

_buildAssets(data.args.index).then((result) => parentPort?.postMessage(result));

async function _buildAssets(
    index: Map<string, Shared.FileBrowser.FileEntry[]>,
): Promise<Map<Shared.Asset.AssetId, Shared.Asset.Asset>> {
    const assets = new Map<Shared.Asset.AssetId, Shared.Asset.Asset>();

    for (const filePaths of index.values()) {
        for (const filePath of filePaths) {
            let asset: Shared.Asset.Asset | undefined = undefined;

            if (filePath.path.startsWith("content")) {
                asset = await _scanContentFile(filePath);
            } else if (filePath.path.startsWith("game")) {
                asset = await _scanGameFile(filePath);
            }

            if (asset) {
                const duplicateOther = assets.get(asset.def.id);
                if (duplicateOther !== undefined) {
                    // Logger.warning(
                    //     Shared.Log.Channel.Assets,
                    //     "Asset definition file",
                    //     filePath,
                    //     "has the same id as",
                    //     duplicateOther.def.id,
                    //     definition.id,
                    //     "and will be ignored",
                    // );
                }
            }
        }
    }

    return assets;
}

async function _scanContentFile(filePath: Shared.FileBrowser.FileEntry): Promise<Shared.Asset.Asset | undefined> {
    let def: Shared.Asset.AssetDef | undefined;
    let isTransient = false;

    if (Shared.Asset.isMcaFile(filePath.path)) {
        def = await _readMcaFile(filePath.path, data.common.appConfig.rootPath);
    } else if (Shared.Asset.isQcFile(filePath.path)) {
        def = await _readQcFile(filePath.path, data.common.appConfig.rootPath);
        isTransient = true;
    } else {
        return undefined;
    }

    if (def === undefined) {
        // Logger.warning(Shared.Log.Channel.Assets, "Asset", filePath, "is invalid and will be ignored");
        return undefined;
    }

    const asset: Shared.Asset.Asset = {
        def: def,
        defFilePath: Shared.SourceFs.forwardSlashed(filePath.path),
        isTransient,
    };
    return asset;
}

async function _scanGameFile(filePath: Shared.FileBrowser.FileEntry): Promise<Shared.Asset.Asset | undefined> {
    if (Shared.Asset.isVmtFile(filePath.path)) {
        const asset: Shared.Asset.Asset = {
            def: {
                displayName: filePath.path,
                id: filePath.path,
                gameFiles:
            },
            defFilePath: Shared.SourceFs.forwardSlashed(filePath.path),
            isTransient: true,
        };
    }

    return undefined;
}

async function _readMcaFile(fileName: string, fileRootPath: string): Promise<Shared.Asset.AssetDef | undefined> {
    const fullPath = pathe.join(fileRootPath, fileName);
    const text = await fs.readFile(fullPath, "utf-8");
    const unk = JSON.parse(text);

    if (unk.type === undefined) {
        // Logger.warning(Shared.Log.Channel.Assets, "Asset definition file", fileName, "has no type");
        return undefined;
    }
    if (unk.id === undefined) {
        // Logger.warning(Shared.Log.Channel.Assets, "Asset definition file", fileName, "has no id");
        return undefined;
    }
    if (!Shared.Asset.isValidAssetType(unk.type)) {
        // Logger.warning(Shared.Log.Channel.Assets, "Asset definition file", fileName, "has invalid type ", unk.type);
        return undefined;
    }

    return unk;
}

async function _readQcFile(fileName: string, fileRootPath: string): Promise<Shared.Asset.AssetDef | undefined> {
    const fullPath = pathe.join(fileRootPath, fileName);
    const text = await fs.readFile(fullPath, "utf-8");
    const qcDoc = sourcelib.qc.QcParser.parseText(text);
    const refs = sourcelib.qc.QcUtils.getAllReferencedModelInputFiles(qcDoc);

    const def = Shared.AssetModel.createModelAssetDefinition(data.common.appConfig, fullPath, refs);
    // TODO: Check if content files exist
    return def;
}

async function _readVmtFile(fileName: string, fileRootPath: string): Promise<Shared.Asset.AssetDef | undefined> {
    const fullPath = pathe.join(fileRootPath, fileName);
    const text = await fs.readFile(fullPath, "utf-8");
    const vmtDoc = sourcelib.kv.KvSerializer.deserializeText(fileName);

    const def = Shared.AssetMaterial.createMaterialAssetDefinition(data.common.appConfig, fullPath);
}
