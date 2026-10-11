import { ipcMain } from "electron";
import * as Shared from "mod_companion_shared";
import * as Core from "mod_companion_core";
import { IpcHelper } from "./MainApiHelper.js";

export const TaskApi = {
    register(): boolean {
        ipcMain.on(Shared.Ipc.Channels.TaskCreateFake, (event: Electron.IpcMainInvokeEvent): void => {
            Core.TaskSystem.createFakeTask();
        });

        return true;
    },

    notifyStartTask(task: Shared.Task.Task): void {
        IpcHelper.send(Shared.Ipc.Channels.TaskStart, task);
    },
    notifyUpdateTask(taskId: Shared.Task.TaskId, quantity: number): void {
        IpcHelper.send(Shared.Ipc.Channels.TaskUpdate, taskId, quantity);
    },
    notifyEndTask(taskId: Shared.Task.TaskId): void {
        IpcHelper.send(Shared.Ipc.Channels.TaskEnd, taskId);
    },
};
