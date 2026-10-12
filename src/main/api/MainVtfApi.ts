import { ipcMain } from "electron";
import * as Shared from "mod_companion_shared";
import * as Core from "mod_companion_core";

export const VtfApi = {
    register(): boolean {
        ipcMain.handle(
            Shared.Ipc.Channels.VtfInfoQuery,
            (event: Electron.IpcMainInvokeEvent, filePath: Shared.Paths.Path): Promise<Shared.Vtf.SharedVtfInfo> => {
                return Core.MareTfSystem.getVtfInfo(filePath);
            },
        );

        ipcMain.handle(
            Shared.Ipc.Channels.VtfExtractQuery,
            (event: Electron.IpcMainInvokeEvent, filePath: Shared.Paths.Path): Promise<string> => {
                return Core.MareTfSystem.getVtfExtract(filePath);
            },
        );

        return true;
    },
};
