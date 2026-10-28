import * as pathe from "pathe";
import * as os from "node:os";
import * as child_process from "node:child_process";
import { Logger } from "../systems/CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import fs from "fs/promises";
import { Stats } from "node:fs";
import * as Core from "../CoreManifest.js";

export async function browseTo(path: Shared.Paths.Path): Promise<void> {
    const fullPath = Shared.Paths.transformPathBase(
        path,
        Shared.Paths.PathBases.Absolute,
        Core.ConfigSystem.getAppConfig(),
    );
    if (!fullPath) {
        Logger.warning(Shared.Log.Channel.FileBrowser, "Cannot browse, the path didn't resolve", path);
        return;
    }

    let command: string | undefined = undefined;

    const stat = await _tryStat(fullPath.path);

    if (!stat) {
        Logger.info(
            Shared.Log.Channel.FileBrowser,
            "Browsing to path that doesn't exist, opening containing directory",
            fullPath.path,
        );
        command = _getBrowseToDirectoryCommand(pathe.dirname(fullPath.path));
    } else if (!stat.isFile()) {
        command = _getBrowseToDirectoryCommand(fullPath.path);
    } else {
        command = _getBrowseToFileSelectCommand(fullPath.path);
    }

    if (command === undefined) {
        Logger.error(Shared.Log.Channel.FileBrowser, "Cannot browse, unsupported OS");
        return;
    }

    // Logger.debug(Shared.Log.Channel.FileBrowser, "Running", command);
    child_process.exec(
        command,
        {
            env: {
                ...process.env,
                LANG: "en_US.UTF-8",
                LC_ALL: "en_US.UTF-8",
            },
        },
        (error) => {
            if (error) {
                // windows bullshit! explorer.exe *always* says it failed even when it succeeds! Woo microslop!
                if (command?.startsWith("explorer.exe")) {
                    return;
                }
                Logger.error(Shared.Log.Channel.FileBrowser, `Failed: ${error.message}`);
            }
        },
    );
}

async function _tryStat(path: string): Promise<Stats | undefined> {
    try {
        return await fs.stat(path);
    } catch (e) {
        return undefined;
    }
}

function _getBrowseToFileSelectCommand(filePath: string): string | undefined {
    const platform = os.platform();

    if (platform === "win32") {
        return `explorer.exe /select,"${Shared.SourceFs.backSlashed(filePath)}"`;
    } else if (platform === "linux") {
        return _getBrowseToFileSelectCommandLinux(filePath);
    }

    return undefined;
}

export function _getBrowseToFileSelectCommandLinux(filePath: string): string | undefined {
    const fileManagers = [
        { mime: "org.kde.dolphin.desktop", cmd: (p: string) => `dolphin --select "${p}"` },
        { mime: "org.gnome.Nautilus.desktop", cmd: (p: string) => `nautilus --select "${p}"` },
        { mime: "nemo.desktop", cmd: (p: string) => `nemo "${p}"` },
        { mime: "thunar.desktop", cmd: (p: string) => `thunar "${pathe.dirname(p)}"` },
    ];

    // get the default file manager
    const defaultFileManager = child_process.execSync("xdg-mime query default inode/directory").toString().trim();
    for (const fm of fileManagers) {
        if (fm.mime === defaultFileManager) {
            return fm.cmd(filePath);
        }
    }

    // fallback
    return `xdg-open "${pathe.dirname(filePath)}"`;
}

function _getBrowseToDirectoryCommand(dirPath: string): string | undefined {
    const platform = os.platform();

    if (platform === "win32") {
        return `explorer.exe "${Shared.SourceFs.backSlashed(dirPath)}"`;
    }
    if (platform === "linux") {
        return `xdg-open "${dirPath}"`;
    }

    return undefined;
}

export async function getFileEntry(path: Shared.Paths.Path): Promise<Shared.FileBrowser.FileEntry | undefined> {
    const fullPath = Shared.Paths.transformPathBase(
        path,
        Shared.Paths.PathBases.Absolute,
        Core.ConfigSystem.getAppConfig(),
    );
    if (!fullPath) {
        Logger.warning(Shared.Log.Channel.FileBrowser, `Cannot get file entry. Path didn't resolve`, path);
        return;
    }

    try {
        const stat = await fs.stat(fullPath?.path);
        if (!stat) return undefined;

        return { path: fullPath.path, fileSize: stat.size, isFile: true, name: pathe.basename(fullPath.path) };
    } catch (e) {
        return undefined;
    }
}

export function openFile(path: Shared.Paths.Path): void {
    const fullPath = Shared.Paths.transformPathBase(
        path,
        Shared.Paths.PathBases.Absolute,
        Core.ConfigSystem.getAppConfig(),
    );
    if (!fullPath) {
        Logger.warning(Shared.Log.Channel.FileBrowser, `Cannot open file. Path didn't resolve`, path);
        return;
    }
    const platform = os.platform();

    let command = "";

    if (platform === "win32") {
        command = `"${fullPath.path}"`;
    } else if (platform === "darwin") {
        command = `open "${fullPath.path}"`;
    } else if (platform === "linux") {
        command = `xdg-open "${fullPath.path}"`;
    } else {
        Logger.error(Shared.Log.Channel.FileBrowser, `Unsupported platform: ${platform}`);
        return;
    }

    child_process.exec(command, (error) => {
        if (error) {
            Logger.error(Shared.Log.Channel.FileBrowser, `Failed to open: ${error.message}`);
        }
    });
}

export function executeFile(path: Shared.Paths.Path): void {
    const fullPath = Shared.Paths.transformPathBase(
        path,
        Shared.Paths.PathBases.Absolute,
        Core.ConfigSystem.getAppConfig(),
    );
    if (!fullPath) {
        Logger.warning(Shared.Log.Channel.FileBrowser, `Cannot execute file. Path didn't resolve`, path);
        return;
    }
    Logger.info(Shared.Log.Channel.FileBrowser, "Executing file", fullPath.path);

    try {
        child_process.execFile(fullPath.path, { shell: true }, (error, stdout, stderr) => {
            if (error) {
                Logger.warning(Shared.Log.Channel.FileBrowser, error);
            }
            if (stdout) {
                Logger.info(Shared.Log.Channel.FileBrowser, stdout);
            }
            if (stderr) {
                Logger.warning(Shared.Log.Channel.FileBrowser, stderr);
            }
        });
    } catch (e) {
        Logger.warning(Shared.Log.Channel.FileBrowser, e);
    }
}
