import * as Shared from "mod_companion_shared";
import * as pathe from "pathe";
import fs from "node:fs/promises";
import * as sourcelib from "sourcelib";
import { useWorkerThreadData, useWorkerThreadResponse } from "../helpers/CoreWorkerHelper.js";

const data = useWorkerThreadData<typeof Shared.Workers.WorkerFile.AssetScanner>();
const messages = useWorkerThreadResponse<typeof Shared.Workers.WorkerFile.AssetScanner>();

_buildAssets(data.args.index).then((result) => messages.done(result));

async function _buildAssets(
    index: Map<string, Shared.FileBrowser.FileEntry[]>,
): Promise<Map<Shared.Asset.AssetId, Shared.Asset.Asset>> {
    const assets = new Map<Shared.Asset.AssetId, Shared.Asset.Asset>();

    const progressTotal = index.size;
    let progressNow = 0;
    for (const filePaths of index.values()) {
        for (const filePath of filePaths) {
            let asset: Shared.Asset.Asset | undefined = undefined;

            if (filePath.path.startsWith("content")) {
                asset = await _scanContentFile(filePath);
            } else if (filePath.path.startsWith("game")) {
                asset = await _scanGameFile(filePath);
            }

            if (!asset) continue;
            const duplicateOther = assets.get(asset.def.id);
            if (duplicateOther !== undefined) {
                messages.log.warning(
                    Shared.Log.Channel.Assets,
                    "Asset",
                    filePath,
                    "has the same id as",
                    duplicateOther.def.id,
                    asset.def.id,
                    "and will be ignored",
                );
                continue;
            }

            assets.set(asset.def.id, asset);
        }

        _postProgress(progressTotal, ++progressNow);
    }

    return assets;
}

function _postProgress(progressTotal: number, progressNow: number) {
    messages.post({ progressNow, progressTotal });
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
        messages.log.warning(Shared.Log.Channel.Assets, "Asset", filePath, "is invalid and will be ignored");
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
        const materialDef = await _readVmtFile(filePath.path, data.common.appConfig.rootPath);
        if (!materialDef) return undefined;
        const asset: Shared.Asset.Asset = {
            def: materialDef,
            defFilePath: Shared.SourceFs.forwardSlashed(filePath.path),
            isTransient: true,
        };
        return asset;
    }

    return undefined;
}

async function _tryReadAssetDef(fullPath: string): Promise<string | undefined> {
    try {
        return await fs.readFile(fullPath, "utf-8");
    } catch (e) {
        messages.log.warning(Shared.Log.Channel.Assets, "Failed to read asset definition at", fullPath);
        return undefined;
    }
}

async function _readMcaFile(fileName: string, fileRootPath: string): Promise<Shared.Asset.AssetDef | undefined> {
    const fullPath = pathe.join(fileRootPath, fileName);
    const text = await fs.readFile(fullPath, "utf-8");
    const unk = JSON.parse(text);

    if (unk.type === undefined) {
        messages.log.warning(Shared.Log.Channel.Assets, "Asset definition file", fileName, "has no type");
        return undefined;
    }
    if (unk.id === undefined) {
        messages.log.warning(Shared.Log.Channel.Assets, "Asset definition file", fileName, "has no id");
        return undefined;
    }
    if (!Shared.Asset.isValidAssetType(unk.type)) {
        messages.log.warning(
            Shared.Log.Channel.Assets,
            "Asset definition file",
            fileName,
            "has invalid type ",
            unk.type,
        );
        return undefined;
    }

    return unk;
}

async function _readQcFile(fileName: string, fileRootPath: string): Promise<Shared.Asset.AssetDef | undefined> {
    const fullPath = pathe.join(fileRootPath, fileName);
    const text = await _tryReadAssetDef(fullPath);
    if (!text) return undefined;

    const qcDoc = sourcelib.qc.QcParser.parseText(text);
    const refs = sourcelib.qc.QcUtils.getAllReferencedModelInputFiles(qcDoc);

    const def = Shared.AssetModel.createModelAssetDefinition(data.common.appConfig, fullPath, refs);
    // TODO: Check if content files exist
    return def;
}

async function _readVmtFile(fileName: string, fileRootPath: string): Promise<Shared.Asset.AssetDef | undefined> {
    const fullPath = pathe.join(fileRootPath, fileName);
    const text = await _tryReadAssetDef(fullPath);
    if (!text) return undefined;

    const doc = sourcelib.kv.KvSerializer.deserializeText(text);
    let vmt: Shared.AssetMaterial.VmtDocument | undefined = undefined;
    if (doc.length > 0) {
        vmt = doc[0] as Shared.AssetMaterial.VmtDocument;
    } else {
        messages.log.warning(
            Shared.Log.Channel.Assets,
            "Failed to deserialize VMT",
            fileName,
            "It will still appear as an asset, but texture relationships cannot be created",
        );
    }

    const def = Shared.AssetMaterial.createMaterialAssetDefinition(data.common.appConfig, fullPath, vmt);
    return def;
}
