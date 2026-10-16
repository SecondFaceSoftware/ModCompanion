import { ipcMain } from "electron";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { Stream } from "node:stream";
import * as Shared from "mod_companion_shared";
import * as Core from "mod_companion_core";

export function registerFileApi(): boolean {
    ipcMain.handle(
        Shared.Ipc.Channels.FileReadString,
        async (event: Electron.IpcMainInvokeEvent, path: Shared.Paths.Path): Promise<string | undefined> => {
            const fullPath = Shared.Paths.transformPathBase(
                path,
                Shared.Paths.PathBases.Absolute,
                Core.ConfigSystem.getAppConfig(),
            );
            if (!fullPath) return;

            try {
                return await fs.readFile(fullPath.path, "utf-8");
            } catch (e) {
                return undefined;
            }
        },
    );

    ipcMain.handle(
        Shared.Ipc.Channels.FileWriteString,
        async (
            event: Electron.IpcMainInvokeEvent,
            path: Shared.Paths.Path,
            data:
                | string
                | NodeJS.ArrayBufferView
                | Iterable<string | NodeJS.ArrayBufferView>
                | AsyncIterable<string | NodeJS.ArrayBufferView>
                | Stream,
        ): Promise<void> => {
            const fullPath = Shared.Paths.transformPathBase(
                path,
                Shared.Paths.PathBases.Absolute,
                Core.ConfigSystem.getAppConfig(),
            );
            if (!fullPath) {
                Core.Logger.warning(
                    Shared.Log.Channel.FileBrowser,
                    "Failed to write",
                    path,
                    "because the path didn't resolve to an absolute path",
                );
                return;
            }

            Core.Logger.info(Shared.Log.Channel.FileBrowser, "Writing to", fullPath.path);
            return fs.writeFile(fullPath.path, data);
        },
    );

    ipcMain.handle(
        Shared.Ipc.Channels.FileDelete,
        async (event: Electron.IpcMainInvokeEvent, path: Shared.Paths.Path): Promise<boolean> => {
            const fullPath = Shared.Paths.transformPathBase(
                path,
                Shared.Paths.PathBases.Absolute,
                Core.ConfigSystem.getAppConfig(),
            );
            if (!fullPath) {
                Core.Logger.warning(
                    Shared.Log.Channel.FileBrowser,
                    "Failed to delete",
                    path,
                    "because the path didn't resolve to an absolute path",
                );
                return false;
            }

            try {
                Core.Logger.info(Shared.Log.Channel.FileBrowser, "Deleting", fullPath.path);
                await fs.rm(fullPath.path);
                return true;
            } catch (e) {
                Core.Logger.warning(Shared.Log.Channel.FileBrowser, "Failed to delete", fullPath.path);
                return false;
            }
        },
    );

    ipcMain.handle(
        Shared.Ipc.Channels.FileExists,
        (event: Electron.IpcMainInvokeEvent, path: Shared.Paths.Path): boolean => {
            const fullPath = Shared.Paths.transformPathBase(
                path,
                Shared.Paths.PathBases.Absolute,
                Core.ConfigSystem.getAppConfig(),
            );
            if (!fullPath) {
                Core.Logger.warning(
                    Shared.Log.Channel.FileBrowser,
                    "Failed to check if",
                    path,
                    "exists because the path didn't resolve to an absolute path",
                );
                return false;
            }

            return existsSync(fullPath.path);
        },
    );

    return true;
}
