import { ipcMain } from "electron";
import * as child_process from "node:child_process";

import * as Core from "mod_companion_core";
import * as Shared from "mod_companion_shared";

export function registerFgdApi(): boolean {
    ipcMain.handle(Shared.Ipc.Channels.FgdBuild, () => {
        return new Promise<boolean>((resolve) => {
            Core.TaskSystem.startTask({
                taskId: Shared.Task.TaskIds.BuildFgd,
                quantityGoal: null,
            });

            const cmd = `python content/revolution/fgd_builder/unify_fgd.py exp revolution srctools -o "game/revolution/revolution2.fgd"`;
            const cwd = Core.ConfigSystem.getAppConfig().rootPath;
            const proc = child_process.exec(cmd, { cwd }, (error, stdout, stderr) => {
                if (error) {
                    Core.Logger.warning(Shared.Log.Channel.Fgd, error);
                }
                if (stdout) {
                    Core.Logger.info(Shared.Log.Channel.Fgd, stdout);
                }
                if (stderr) {
                    Core.Logger.warning(Shared.Log.Channel.Fgd, stderr);
                }
            });
            proc.on("exit", (code) => {
                resolve(code === 0);
                Core.TaskSystem.endTask(Shared.Task.TaskIds.BuildFgd);
            });
        });
    });
    return true;
}
