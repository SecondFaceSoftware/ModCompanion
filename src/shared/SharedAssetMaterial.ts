import { AppConfig } from "./SharedAppConfig.js";
import * as pathe from "pathe";
import { filename } from "pathe/utils";
import { MaterialAssetDef, ModelAssetDef, Types } from "./SharedAsset.js";
import { forwardSlashed } from "./SharedSourceFs.js";

function _disassembleMaterialName(contentFile: string): { sub: string; name: string } {
    const materialsrc = "materials";
    const start = contentFile.indexOf(materialsrc) + materialsrc.length + 1;
    const sub = contentFile.substring(start);
    const name = filename(sub) ?? pathe.basename(sub);

    return { sub, name };
}

function _deriveMaterialDisplayName(contentFile: string): string {
    const { sub, name } = _disassembleMaterialName(contentFile);
    const stripped = pathe.join(pathe.dirname(sub), name);
    return forwardSlashed(stripped);
}

export function createMaterialAssetDefinition(
    config: AppConfig,
    qcPath: string,
    refs: Iterable<string>,
): MaterialAssetDef {
    const stripStart = config.contentPath.length + 1;
    const contentFiles: string[] = [];
    for (const ref of refs) {
        const absRef = pathe.dirname(qcPath);
        const fullRefFilePath = pathe.join(absRef, ref);
        const stripped = fullRefFilePath.substring(stripStart);
        contentFiles.push(stripped);
    }

    const id = qcPath.substring(config.rootPath.length + 1);
    const displayName = _deriveMaterialDisplayName(qcPath);

    const assetDef: ModelAssetDef = {
        type: Types.Model,
        id,
        contentFiles,
        displayName,
    };

    return assetDef;
}
