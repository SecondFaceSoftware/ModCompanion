import { ipcMain } from "electron";

import * as Core from "mod_companion_core";
import * as Shared from "mod_companion_shared";

export function registerMdlInfoApi() {
    ipcMain.handle(Shared.Ipc.Channels.MdlInfoGet, (e, mdlFilePath: Shared.Paths.Path) => {
        return Core.MdlInfoHelper.run(mdlFilePath);
    });

    return true;
}
