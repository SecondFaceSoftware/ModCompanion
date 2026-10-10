import * as Shared from "mod_companion_shared";
import { IpcHelper } from "./MainApiHelper.js";

export const TaskApi = {
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
