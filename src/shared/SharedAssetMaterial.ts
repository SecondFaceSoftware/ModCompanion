import { AppConfig } from "./SharedAppConfig.js";
import { MaterialAssetDef, Types } from "./SharedAsset.js";
import { forwardSlashed, getRootRelativePath } from "./SharedSourceFs.js";

export type VmtDocument = {};

function _deriveMaterialDisplayName(vmtFile: string): string {
    const typeDir = "materials";
    const start = vmtFile.indexOf(typeDir) + typeDir.length + 1;
    return forwardSlashed(vmtFile.substring(start)).replace(".vmt", "");
}

export function createMaterialAssetDefinition(
    config: AppConfig,
    vmtPath: string,
    vmtDocument: VmtDocument,
): MaterialAssetDef {
    const rootRelativeVmf = getRootRelativePath(vmtPath, config.gamePath);

    const id = vmtPath.substring(config.rootPath.length + 1);
    const displayName = _deriveMaterialDisplayName(vmtPath);

    const assetDef: MaterialAssetDef = {
        type: Types.Material,
        id,
        gameFiles: [rootRelativeVmf],
        displayName,
        vmtDocument,
    };

    return assetDef;
}
