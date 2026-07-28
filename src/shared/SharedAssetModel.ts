import { AppConfig } from "./SharedAppConfig.js";
import * as pathe from "pathe";
import { filename } from "pathe/utils";
import { ModelAssetDef, Types } from "./SharedAsset.js";
import { forwardSlashed } from "./SharedSourceFs.js";

function _disassembleModelName(contentFile: string): { sub: string; name: string } {
    const typeDir = "models";
    const start = contentFile.indexOf(typeDir) + typeDir.length + 1;
    const sub = contentFile.substring(start);
    const name = filename(sub) ?? pathe.basename(sub);

    return { sub, name };
}

function _deriveModelDisplayName(contentFile: string): string {
    const { sub, name } = _disassembleModelName(contentFile);
    const stripped = pathe.join(pathe.dirname(sub), name);
    return forwardSlashed(stripped);
}

export function createModelAssetDefinition(config: AppConfig, qcPath: string, refs: Iterable<string>): ModelAssetDef {
    const stripStart = config.contentPath.length + 1;
    const contentFiles: string[] = [];
    const absRef = pathe.dirname(qcPath);
    for (const ref of refs) {
        const fullRefFilePath = pathe.join(absRef, ref);
        const stripped = fullRefFilePath.substring(stripStart);
        contentFiles.push(stripped);
    }

    const id = qcPath.substring(config.rootPath.length + 1);
    const displayName = _deriveModelDisplayName(qcPath);

    const assetDef: ModelAssetDef = {
        type: Types.Model,
        id,
        contentFiles,
        displayName,
    };

    return assetDef;
}
