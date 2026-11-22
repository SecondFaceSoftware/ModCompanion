import { AppConfig } from "./SharedAppConfig.js";
import * as pathe from "pathe";
import { filename } from "pathe/utils";
import { ModelAssetDef, Types } from "./SharedAsset.js";
import { forwardSlashed } from "./SharedSourceFs.js";
import { changeExtension, createPath, Path, PathBases, transformPathBase } from "./SharedPaths.js";

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

/**
 * @param config
 * @param qcPathAbs Absolute file path to the qc
 * @param refs All the source model files this qc references
 * @param modelName The $modelname value from the qc
 */
export function createModelAssetDefinition(
    config: AppConfig,
    qcPathAbs: string,
    refs: Iterable<string>,
    modelName: string,
): ModelAssetDef {
    // prepare content files
    const stripStart = config.contentPath.length + 1;
    const contentFiles: string[] = [qcPathAbs.substring(stripStart)];
    const absRef = pathe.dirname(qcPathAbs);
    for (const ref of refs) {
        const fullRefFilePath = pathe.join(absRef, ref);
        const stripped = fullRefFilePath.substring(stripStart);
        contentFiles.push(stripped);
    }

    // prepare game files
    const gameFilesSomeBase: Path[] = [changeExtension(createPath(modelName, PathBases.GameModels), ".mdl")];
    const gameFiles = gameFilesSomeBase
        .map((g) => transformPathBase(g, PathBases.Game, config)?.path)
        .filter((g) => g !== undefined) as string[];

    const id = qcPathAbs.substring(config.rootPath.length + 1);
    const displayName = _deriveModelDisplayName(qcPathAbs);

    const assetDef: ModelAssetDef = {
        type: Types.Model,
        id,
        contentFiles,
        gameFiles,
        displayName,
    };

    return assetDef;
}
