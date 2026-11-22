import * as pathe from "pathe";

export function getRelativePath(
    filePath: string,
    absolutePrefix: string,
    relativePrefix: string,
    gameName: string,
): string {
    const file = forwardSlashed(filePath.toLowerCase());
    const prefix = forwardSlashed(absolutePrefix.toLowerCase());

    const isAbsolute = file.startsWith(prefix);
    if (isAbsolute) {
        return stripPathStart(filePath, absolutePrefix);
    }

    const relative = pathe.join(relativePrefix, gameName);
    const isRelativeToGameRoot = file.startsWith(relative);
    if (isRelativeToGameRoot) {
        return stripPathStart(filePath, relative);
    }

    return filePath;
}

export function getGameOrContentRelativePath(filePath: string, gameName: string, rootPath: string): string {
    const file = forwardSlashed(filePath);
    const root = forwardSlashed(rootPath);

    const isAbsolute = file.startsWith(root);
    let start = isAbsolute ? rootPath.length : 0;

    if (file.startsWith(pathe.join("content", gameName), start)) {
        start += "content".length;
    } else if (file.startsWith(pathe.join("game", gameName), start)) {
        start += "game".length;
    }

    start += gameName.length + 2; // 2 slashes
    return forwardSlashed(file.substring(start));
}

export function getRootRelativePath(absoluteFilePath: string, rootPath: string): string {
    const file = forwardSlashed(absoluteFilePath);
    const root = forwardSlashed(rootPath);

    const isAbsolute = file.startsWith(root);
    if (isAbsolute) {
        return forwardSlashed(file.substring(rootPath.length + 1));
    }

    return absoluteFilePath;
}

export function isRelativeToRoot(filePath: string, gameName: string): boolean {
    return filePath.startsWith("content" + "/" + gameName) || filePath.startsWith("game" + "/" + gameName);
}

export function forwardSlashed(str: string): string {
    return str.replace(/\\/g, "/");
}

export function backSlashed(str: string): string {
    return str.replace(/\//g, "\\");
}

export function stripPathStart(filePath: string, prefix: string): string {
    return forwardSlashed(filePath.substring(prefix.length + 1));
}

export function isProjectPath(p: string, rootPath: string): boolean {
    return pathe.resolve(p).startsWith(rootPath);
}

export function correctProjectPath(somePath: string, rootPath: string) {
    const p = forwardSlashed(somePath);
    if (!pathe.isAbsolute(p)) {
        return p;
    }
    const ind = p.indexOf(rootPath);
    if (ind !== 0) return undefined;

    return stripPathStart(p, rootPath);
}

export function makeContentPathAbsolute(contentPath: string, contentRelativePath: string): string {
    return pathe.join(contentPath, contentRelativePath);
}

export function makeGamePathAbsolute(gamePath: string, gameRelativePath: string): string {
    return pathe.join(gamePath, gameRelativePath);
}
