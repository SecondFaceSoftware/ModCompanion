import { ipcMain } from "electron";
import * as Shared from "mod_companion_shared";
import * as Core from "mod_companion_core";

export function registerAppConfigApi(): boolean {
    ipcMain.handle(Shared.Ipc.Channels.ConfigGet, () => {
        return Core.ConfigSystem.getAppConfig();
    });
    return true;
}
