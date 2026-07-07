import * as pathe from "pathe";
import { filename } from "pathe/utils";
import * as Shared from "mod_companion_shared";
import { getGameOrContentRelativePath } from "../../helpers/CoreSourceFs.js";
import { existsSync } from "fs";
import { ConfigSystem } from "../CoreConfigSystem.js";

function _disassembleModelName(contentFile: string): { sub: string; name: string } {
    const materialsrc = "models";
    const start = contentFile.indexOf(materialsrc) + materialsrc.length + 1;
    const sub = contentFile.substring(start);
    const name = filename(sub) ?? pathe.basename(sub);

    return { sub, name };
}

export function deriveModelDisplayName(contentFile: string): string {
    const { sub, name } = _disassembleModelName(contentFile);
    const stripped = pathe.join(pathe.dirname(sub), name);
    return Shared.SourceFs.forwardSlashed(stripped);
}

export function createModelAssetDefinition(qcPath: string, refs: Iterable<string>): Shared.Asset.ModelAssetDef {
    const stripStart = ConfigSystem.getAppConfig().contentPath.length + 1;
    const contentFiles: string[] = [];
    for (const ref of refs) {
        const absRef = pathe.dirname(qcPath);
        const fullRefFilePath = pathe.join(absRef, ref);
        if (existsSync(fullRefFilePath)) {
            const stripped = fullRefFilePath.substring(stripStart);
            contentFiles.push(stripped);
        }
    }

    const id = qcPath.substring(ConfigSystem.getAppConfig().rootPath.length + 1);

    const assetDef: Shared.Asset.ModelAssetDef = {
        type: Shared.Asset.Types.Model,
        id,
        contentFiles,
        displayName: deriveModelDisplayName(qcPath),
    };

    return assetDef;
}
