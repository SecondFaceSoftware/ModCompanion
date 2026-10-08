import { AppConfig } from "./SharedAppConfig.js";
import * as pathe from "pathe";
import { forwardSlashed, getRootRelativePath } from "./SharedSourceFs.js";

export const PathBases = {
    Absolute: 0,
    RootRelative: 1,
    GameRelative: 2,
    ContentRelative: 3,
    GameMaterial: 4,
} as const;
export type PathBase = (typeof PathBases)[keyof typeof PathBases];

export interface Path<Base extends PathBase> {
    path: string;
    base: Base;
}

export function getBasePrefixPath(base: PathBase | undefined, config: AppConfig): string {
    switch (base) {
        case PathBases.RootRelative:
            return config.rootPath;
        case PathBases.GameRelative:
            return config.gamePath;
        case PathBases.ContentRelative:
            return config.contentPath;
        case PathBases.Absolute:
        default:
            return "";
    }
}

export function createPath<Base extends PathBase>(path: string, base: Base): Path<Base> {
    return { path, base };
}

export function transformPathBase<InputBase extends PathBase, OutputBase extends PathBase>(
    inputPath: Path<InputBase>,
    targetBase: OutputBase,
    config: AppConfig,
): Path<OutputBase> | undefined {
    const rootRelative = _transformPathToRootRelative(inputPath, config);
    if (rootRelative === undefined) return undefined;

    switch (targetBase) {
        case PathBases.Absolute: {
            return createPath(pathe.join(config.rootPath, rootRelative.path), PathBases.Absolute) as Path<OutputBase>;
        }
        case PathBases.RootRelative: {
            return rootRelative as Path<OutputBase>;
        }
        case PathBases.GameRelative: {
            return createPath(
                rootRelative.path.substring(pathe.join("game", config.gameName).length + 1),
                PathBases.GameRelative,
            ) as Path<OutputBase>;
        }
        case PathBases.ContentRelative: {
            return createPath(
                rootRelative.path.substring(pathe.join("content", config.gameName).length + 1),
                PathBases.ContentRelative,
            ) as Path<OutputBase>;
        }
        case PathBases.GameMaterial: {
            return createPath(
                _transformRootRelativeToGameMaterial(rootRelative.path),
                PathBases.GameMaterial,
            ) as Path<OutputBase>;
        }
        default: {
            return undefined;
        }
    }
}

export function stripExtension<Base extends PathBase>(path: Path<Base>): Path<Base> {
    const ext = pathe.extname(path.path);
    if (ext.length === 0) return path;
    const pathWithoutExt = pathe.normalizeString(path.path.substring(0, path.path.lastIndexOf(ext)), true);
    return createPath(pathWithoutExt, path.base);
}

function _transformPathToRootRelative<InputBase extends PathBase>(
    inputPath: Path<InputBase>,
    config: AppConfig,
): Path<typeof PathBases.RootRelative> | undefined {
    switch (inputPath.base) {
        case PathBases.Absolute: {
            return { path: getRootRelativePath(inputPath.path, config.rootPath), base: PathBases.RootRelative };
        }
        case PathBases.RootRelative: {
            return inputPath as Path<typeof PathBases.RootRelative>;
        }
        case PathBases.GameRelative: {
            return { path: pathe.join("game", config.gameName, inputPath.path), base: PathBases.RootRelative };
        }
        case PathBases.ContentRelative: {
            return { path: pathe.join("content", config.gameName, inputPath.path), base: PathBases.RootRelative };
        }
        default: {
            return undefined;
        }
    }
}

function _transformRootRelativeToGameMaterial(rootRelativePath: string): string {
    const splits = forwardSlashed(rootRelativePath).split("/");
    for (let i = 0; i < splits.length; i++) {
        const split = splits[i];
        if (split === "materials") {
            const trimmed = splits.slice(i + 1).join("/");
            return trimmed;
        }
    }

    return rootRelativePath;
}
