import { ipcMain } from "electron";
import * as pathe from "pathe";
import { IpcHelper } from "./MainApiHelper.js";

import * as Core from "mod_companion_core";
import * as Shared from "mod_companion_shared";
import { FileEntry } from "mod_companion_shared/SharedFileBrowser.js";

export const FileBrowserApi = {
    register(): boolean {
        ipcMain.on(
            Shared.Ipc.Channels.FileBrowser_BrowseToFileAction,
            (event: Electron.IpcMainEvent, path: Shared.Paths.Path): Promise<void> => {
                return Core.FileBrowseHelper.browseTo(path);
            },
        );

        ipcMain.handle(
            Shared.Ipc.Channels.FileBrowser_FileEntryQuery,
            (event: Electron.IpcMainInvokeEvent, path: Shared.Paths.Path): Promise<FileEntry | undefined> => {
                return Core.FileBrowseHelper.getFileEntry(path);
            },
        );

        ipcMain.on(
            Shared.Ipc.Channels.FileBrowser_OpenAction,
            (event: Electron.IpcMainEvent, path: Shared.Paths.Path[] | Shared.Paths.Path): void => {
                if (Array.isArray(path)) {
                    for (const p of path) {
                        Core.FileBrowseHelper.openFile(p);
                    }
                } else {
                    Core.FileBrowseHelper.openFile(path);
                }
            },
        );

        ipcMain.handle(
            Shared.Ipc.Channels.FileBrowser_ListFilesQuery,
            async (event: Electron.IpcMainInvokeEvent, dirPath: string): Promise<Shared.FileBrowser.FileEntries> => {
                const config = Core.ConfigSystem.getAppConfig();
                const fullPath = pathe.join(config.rootPath, dirPath);
                const results = await Core.FileBrowserSystem.listFiles(fullPath, dirPath);
                return results;
            },
        );

        ipcMain.on(
            Shared.Ipc.Channels.FileBrowser_ExecuteAction,
            (event: Electron.IpcMainEvent, path: Shared.Paths.Path[] | Shared.Paths.Path): void => {
                if (Array.isArray(path)) {
                    for (const p of path) {
                        Core.FileBrowseHelper.executeFile(p);
                    }
                } else {
                    Core.FileBrowseHelper.executeFile(path);
                }
            },
        );

        ipcMain.on(
            Shared.Ipc.Channels.FileBrowser_UpdateOpenedDirsAction,
            (event: Electron.IpcMainEvent, dirs: string[]): void => {
                Core.FileBrowserSystem.updateOpenedDirs(dirs);
            },
        );

        return true;
    },

    notifyDirUpdated(dir: string, entries: Shared.FileBrowser.FileEntries): void {
        IpcHelper.send(Shared.Ipc.Channels.FileBrowser_DirUpdatedEvent, dir, entries);
    },
    notifyIndexUpdated(index: Map<string, Shared.FileBrowser.FileEntry[]>): void {
        IpcHelper.send(Shared.Ipc.Channels.FileBrowser_IndexUpdatedEvent, index);
    },
};
