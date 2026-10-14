import { ipcMain } from "electron";
import { IpcHelper } from "./MainApiHelper.js";

import * as Core from "mod_companion_core";
import * as Shared from "mod_companion_shared";

export function registerMapCompileApi(): boolean {
    ipcMain.on(Shared.Ipc.Channels.MapQueueEnqueue, (event, mapPaths: Shared.Paths.Path[]) => {
        Core.MapCompileSystem.enqueue(mapPaths);
    });
    ipcMain.on(Shared.Ipc.Channels.MapQueueSetPaused, (event, paused: boolean) => {
        Core.MapCompileSystem.setPaused(paused);
    });
    ipcMain.on(Shared.Ipc.Channels.MapQueueCancel, () => {
        Core.MapCompileSystem.cancelQueue();
    });
    return true;
}

export function notifyMapQueueUpdated(queue: Shared.Paths.Path[]): void {
    IpcHelper.send(Shared.Ipc.Channels.MapQueueUpdated, queue);
}

export function notifyMapCompileLog(event: Shared.Map.CompileLogEvent): void {
    IpcHelper.send(Shared.Ipc.Channels.MapCompileLog, event);
}

export function notifyMapCompileProgress(event: Shared.Map.CompileProgressEvent): void {
    IpcHelper.send(Shared.Ipc.Channels.MapCompileProgress, event);
}
