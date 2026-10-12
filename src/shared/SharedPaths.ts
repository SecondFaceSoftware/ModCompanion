import { AppConfig } from "./SharedAppConfig.js";
import * as pathe from "pathe";
import { filename } from "pathe/utils";
import { forwardSlashed, getRootRelativePath } from "./SharedSourceFs.js";

export const PathBases = {
    Absolute: 0,
    Root: 1,
    Game: 2,
    Content: 3,
    GameMaterial: 4,
    GameMaps: 5,
    ContentMaps: 6,
} as const;
export type PathBase = (typeof PathBases)[keyof typeof PathBases];

export interface Path {
    path: string;
    base: PathBase;
}

export function getBasePrefixPath(base: PathBase | undefined, config: AppConfig): string {
    switch (base) {
        case PathBases.Root:
            return config.rootPath;
        case PathBases.Game:
            return config.gamePath;
        case PathBases.Content:
            return config.contentPath;
        case PathBases.Absolute:
        default:
            return "";
    }
}

export function createPath<Base extends PathBase>(path: string, base: Base): Path {
    return { path, base };
}

export function transformPathBase<OutputBase extends PathBase>(
    inputPath: Path,
    targetBase: OutputBase,
    config: AppConfig,
): Path | undefined {
    const rootRelative = _transformPathToRootRelative(inputPath, config);
    if (rootRelative === undefined) return undefined;

    switch (targetBase) {
        case PathBases.Absolute: {
            return createPath(pathe.join(config.rootPath, rootRelative.path), PathBases.Absolute);
        }
        case PathBases.Root: {
            return rootRelative;
        }
        case PathBases.Game: {
            return createPath(
                rootRelative.path.substring(pathe.join("game", config.gameName).length + 1),
                PathBases.Game,
            );
        }
        case PathBases.Content: {
            return createPath(
                rootRelative.path.substring(pathe.join("content", config.gameName).length + 1),
                PathBases.Content,
            );
        }
        case PathBases.GameMaterial: {
            return createPath(_transformRootRelativeToGameMaterial(rootRelative.path), PathBases.GameMaterial);
        }
        case PathBases.GameMaps: {
            return createPath(
                rootRelative.path.substring(pathe.join("game", config.gameName, "maps").length + 1),
                PathBases.GameMaps,
            );
        }
        case PathBases.ContentMaps: {
            return createPath(
                rootRelative.path.substring(pathe.join("content", config.gameName, "maps").length + 1),
                PathBases.ContentMaps,
            );
        }
        default: {
            return undefined;
        }
    }
}

export function stripExtension(path: Path): Path {
    const ext = pathe.extname(path.path);
    if (ext.length === 0) return path;
    const pathWithoutExt = pathe.normalizeString(path.path.substring(0, path.path.lastIndexOf(ext)), true);
    return createPath(pathWithoutExt, path.base);
}

export function getBspPathFromVmfPath(vmfPath: Path): Path {
    const mapName = filename(vmfPath.path);
    const bspName = mapName + ".bsp";

    const bspPath = createPath(bspName, PathBases.GameMaps);
    return bspPath;
}

function _transformPathToRootRelative(inputPath: Path, config: AppConfig): Path | undefined {
    switch (inputPath.base) {
        case PathBases.Absolute: {
            return createPath(getRootRelativePath(inputPath.path, config.rootPath), PathBases.Root);
        }
        case PathBases.Root: {
            return inputPath;
        }
        case PathBases.Game: {
            return createPath(pathe.join("game", config.gameName, inputPath.path), PathBases.Root);
        }
        case PathBases.Content: {
            return createPath(pathe.join("content", config.gameName, inputPath.path), PathBases.Root);
        }
        case PathBases.GameMaps: {
            return createPath(pathe.join("game", config.gameName, "maps", inputPath.path), PathBases.Root);
        }
        case PathBases.ContentMaps: {
            return createPath(pathe.join("content", config.gameName, "maps", inputPath.path), PathBases.Root);
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
