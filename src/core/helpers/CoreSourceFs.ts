import { ConfigSystem } from "../systems/CoreConfigSystem.js";
import * as Shared from "mod_companion_shared";

export function getContentRelativePath(filePath: string): string {
    const config = ConfigSystem.getAppConfig();
    return Shared.SourceFs.getRelativePath(filePath, config.contentPath, "content", config.gameName);
}

export function getGameRelativePath(filePath: string): string {
    const config = ConfigSystem.getAppConfig();
    return Shared.SourceFs.getRelativePath(filePath, config.gamePath, "game", config.gameName);
}

export function getGameOrContentRelativePath(filePath: string): string {
    const config = ConfigSystem.getAppConfig();
    return Shared.SourceFs.getGameOrContentRelativePath(filePath, config.gameName, config.rootPath);
}

export function isRelativeToRoot(filePath: string): boolean {
    return Shared.SourceFs.isRelativeToRoot(filePath, ConfigSystem.getAppConfig().gameName);
}

export function getRootRelativePath(filePath: string): string {
    return Shared.SourceFs.getRootRelativePath(filePath, ConfigSystem.getAppConfig().rootPath);
}

export function isAbsoluteContentFile(filePath: string): boolean {
    const config = ConfigSystem.getAppConfig();
    return filePath.toLowerCase().startsWith(config.contentPath.toLowerCase());
}

export function isAbsoluteGameFile(filePath: string): boolean {
    const config = ConfigSystem.getAppConfig();
    return filePath.toLowerCase().startsWith(config.gamePath.toLowerCase());
}

export function makeContentPathAbsolute(contentRelativePath: string): string {
    const config = ConfigSystem.getAppConfig();
    return Shared.SourceFs.makeContentPathAbsolute(config.contentPath, contentRelativePath);
}

export function makeGamePathAbsolute(gameRelativePath: string): string {
    const config = ConfigSystem.getAppConfig();
    return Shared.SourceFs.makeGamePathAbsolute(config.gamePath, gameRelativePath);
}
