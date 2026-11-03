// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent, webUtils } from "electron";
import { Stream } from "node:stream";
import * as Shared from "mod_companion_shared";

contextBridge.exposeInMainWorld("electronAPI", {
    app: {
        launch: (launcherType: Shared.Launchers.Launchers, launcherArgs: string) =>
            ipcRenderer.send(Shared.Ipc.Channels.AppLaunch, launcherType, launcherArgs),
        exitForReal: () => ipcRenderer.send(Shared.Ipc.Channels.AppExitForReal),
        closeWindow: () => ipcRenderer.send(Shared.Ipc.Channels.AppCloseWindow),
        minimize: () => ipcRenderer.send(Shared.Ipc.Channels.AppMinimize),
        maximize: () => ipcRenderer.send(Shared.Ipc.Channels.AppMaximize),
        unmaximize: () => ipcRenderer.send(Shared.Ipc.Channels.AppUnmaximize),
        toggleMaximized: () => ipcRenderer.send(Shared.Ipc.Channels.AppToggleMaximized),
        openExternal: (payload: string) => ipcRenderer.send(Shared.Ipc.Channels.AppOpenExternal, payload),
        getAppVersion: () => ipcRenderer.invoke(Shared.Ipc.Channels.AppVersion),
        rendererReady: () => ipcRenderer.send(Shared.Ipc.Channels.AppRendererReady),
    },

    fileBrowser: {
        listFiles: (dirPath: string) => ipcRenderer.invoke(Shared.Ipc.Channels.FileBrowser_ListFilesQuery, dirPath),
        getFileEntry: (path: Shared.Paths.Path) =>
            ipcRenderer.invoke(Shared.Ipc.Channels.FileBrowser_FileEntryQuery, path),
        execute: (path: Shared.Paths.Path | Shared.Paths.Path[]) =>
            ipcRenderer.send(Shared.Ipc.Channels.FileBrowser_ExecuteAction, path),
        browseTo: (path: Shared.Paths.Path) =>
            ipcRenderer.send(Shared.Ipc.Channels.FileBrowser_BrowseToFileAction, path),
        open: (path: Shared.Paths.Path) => ipcRenderer.send(Shared.Ipc.Channels.FileBrowser_OpenAction, path),
        updateOpenedDirs: (dirs: string[]) =>
            ipcRenderer.send(Shared.Ipc.Channels.FileBrowser_UpdateOpenedDirsAction, dirs),
        subscribeDirUpdated: (callback: (dir: string, entries: Shared.FileBrowser.FileEntries) => void) =>
            ipcRenderer.on(
                Shared.Ipc.Channels.FileBrowser_DirUpdatedEvent,
                (e: IpcRendererEvent, dir: string, entries: Shared.FileBrowser.FileEntries) => callback(dir, entries),
            ),
        subscribeIndexUpdated: (callback: (index: Map<string, Shared.FileBrowser.FileEntry[]>) => void) =>
            ipcRenderer.on(
                Shared.Ipc.Channels.FileBrowser_IndexUpdatedEvent,
                (e: IpcRendererEvent, index: Map<string, Shared.FileBrowser.FileEntry[]>) => callback(index),
            ),
    },

    file: {
        readString: (path: Shared.Paths.Path) => ipcRenderer.invoke(Shared.Ipc.Channels.FileReadString, path),
        writeString: (
            path: Shared.Paths.Path,
            data:
                | string
                | NodeJS.ArrayBufferView
                | Iterable<string | NodeJS.ArrayBufferView>
                | AsyncIterable<string | NodeJS.ArrayBufferView>
                | Stream,
        ) => ipcRenderer.invoke(Shared.Ipc.Channels.FileWriteString, path, data),
        delete: (path: Shared.Paths.Path) => ipcRenderer.invoke(Shared.Ipc.Channels.FileDelete, path),
        exists: (path: Shared.Paths.Path) => ipcRenderer.invoke(Shared.Ipc.Channels.FileExists, path),
    },

    config: {
        get: () => ipcRenderer.invoke(Shared.Ipc.Channels.ConfigGet),
    },

    map: {
        listSourceDirs: () => ipcRenderer.invoke(Shared.Ipc.Channels.MapListSourceDirs),
        enqueue: (mapNames: string[]) => ipcRenderer.send(Shared.Ipc.Channels.MapQueueEnqueue, mapNames),
        subscribeQueueUpdated: (callback: (mapNames: string[]) => void) =>
            ipcRenderer.on(Shared.Ipc.Channels.MapQueueUpdated, (e: IpcRendererEvent, mapNames: string[]) =>
                callback(mapNames),
            ),
        cancelQueue: () => ipcRenderer.send(Shared.Ipc.Channels.MapQueueCancel),
        pauseQueue: (paused: boolean) => ipcRenderer.send(Shared.Ipc.Channels.MapQueueSetPaused, paused),
        subscribeCompileLog: (callback: (event: Shared.Map.CompileLogEvent) => void) =>
            ipcRenderer.on(
                Shared.Ipc.Channels.MapCompileLog,
                (e: IpcRendererEvent, event: Shared.Map.CompileLogEvent) => callback(event),
            ),
        subscribeCompileProgress: (callback: (event: Shared.Map.CompileProgressEvent) => void) =>
            ipcRenderer.on(
                Shared.Ipc.Channels.MapCompileProgress,
                (e: IpcRendererEvent, event: Shared.Map.CompileProgressEvent) => callback(event),
            ),
        createTimeReport: (mapNames: string[]) =>
            ipcRenderer.invoke(Shared.Ipc.Channels.MapCreateTimeReport, mapNames) as Promise<Shared.Map.TimeReport>,
    },

    asset: {
        rescan: () => ipcRenderer.send(Shared.Ipc.Channels.AssetForceRescan),
        subscribeRescanned: (callback: (event: Shared.Asset.AssetRescanEvent) => void) =>
            ipcRenderer.on(
                Shared.Ipc.Channels.AssetRescanned,
                (e: IpcRendererEvent, event: Shared.Asset.AssetRescanEvent) => callback(event),
            ),
        subscribeAdded: (callback: (event: Shared.Asset.AssetAddedEvent) => void) =>
            ipcRenderer.on(Shared.Ipc.Channels.AssetAdded, (e: IpcRendererEvent, event: Shared.Asset.AssetAddedEvent) =>
                callback(event),
            ),
        subscribeUpdated: (callback: (event: Shared.Asset.AssetUpdatedEvent) => void) =>
            ipcRenderer.on(
                Shared.Ipc.Channels.AssetUpdated,
                (e: IpcRendererEvent, event: Shared.Asset.AssetUpdatedEvent) => callback(event),
            ),
        subscribeNavigateToHash: (callback: (assetHash: string) => void) =>
            ipcRenderer.on(Shared.Ipc.Channels.AssetNavigateToId, (e: IpcRendererEvent, assetHash: string) =>
                callback(assetHash),
            ),
        createAsset: (primaryFile: string, otherFiles: string[]) =>
            ipcRenderer.invoke(Shared.Ipc.Channels.AssetCreate, primaryFile, otherFiles),
        createEmpty: (mcaFilePath: string) => ipcRenderer.invoke(Shared.Ipc.Channels.AssetCreateEmpty, mcaFilePath),
        update: (assetId: Shared.Asset.AssetId, assetDef: Shared.Asset.AssetDef) =>
            ipcRenderer.invoke(Shared.Ipc.Channels.AssetUpdate, assetId, assetDef),
        delete: (assetId: Shared.Asset.AssetId) => ipcRenderer.invoke(Shared.Ipc.Channels.AssetDelete, assetId),
    },

    assetGroups: {
        forceRescan: () => ipcRenderer.send(Shared.Ipc.Channels.AssetGroupsForceRescan),
        subscribeRescanned: (callback: (event: Shared.AssetGroup.RescanEvent) => void) =>
            ipcRenderer.on(
                Shared.Ipc.Channels.AssetGroupsRescanned,
                (e: IpcRendererEvent, event: Shared.AssetGroup.RescanEvent) => callback(event),
            ),
        create: (assetGroupDef: Shared.AssetGroup.GroupDefinition) =>
            ipcRenderer.invoke(Shared.Ipc.Channels.AssetGroupsCreate, assetGroupDef),
        update: (groupId: Shared.AssetGroup.GroupId, groupDef: Shared.AssetGroup.GroupDefinition) =>
            ipcRenderer.invoke(Shared.Ipc.Channels.AssetGroupsUpdate, groupId, groupDef),
        delete: (groupId: Shared.AssetGroup.GroupId) =>
            ipcRenderer.send(Shared.Ipc.Channels.AssetGroupsDelete, groupId),
    },

    image: {
        getMeta: (imageFilePath: string) => ipcRenderer.invoke(Shared.Ipc.Channels.ImageGetMeta, imageFilePath),
    },

    conversion: {
        enqueue: (assetId: Shared.Asset.AssetId) => ipcRenderer.send(Shared.Ipc.Channels.ConversionEnqueue, assetId),
        enqueueAll: () => ipcRenderer.send(Shared.Ipc.Channels.ConversionEnqueueAll),
        startAgent: () => ipcRenderer.send(Shared.Ipc.Channels.ConversionAgentStart),
        stopAgent: () => ipcRenderer.send(Shared.Ipc.Channels.ConversionAgentStop),
        subscribeUpdated: (callback: (event: Shared.Conversion.UpdateEvent) => void) =>
            ipcRenderer.on(
                Shared.Ipc.Channels.ConversionUpdated,
                (e: IpcRendererEvent, event: Shared.Conversion.UpdateEvent) => callback(event),
            ),
        getState: () => ipcRenderer.invoke(Shared.Ipc.Channels.ConversionGetState),
        clearEvents: () => ipcRenderer.send(Shared.Ipc.Channels.ConversionClearEvents),
    },

    hotReload: {
        setEnabled: (enable: boolean) => ipcRenderer.send(Shared.Ipc.Channels.HotReloadSetEnabled, enable),
    },

    webUtils: {
        getPathForFile: (file: File) => webUtils.getPathForFile(file),
    },

    clipboard: {
        writeText: (text: string, type?: "selection" | "clipboard") =>
            ipcRenderer.send(Shared.Ipc.Channels.ClipboardWriteText, text, type),
    },

    interop: {
        subscribeConnected: (callback: () => void) =>
            ipcRenderer.on(Shared.Ipc.Channels.InteropConnected, () => callback()),
        subscribeDisconnected: (callback: () => void) =>
            ipcRenderer.on(Shared.Ipc.Channels.InteropDisconnected, () => callback()),
        subscribeLog: (callback: (message: string) => void) =>
            ipcRenderer.on(Shared.Ipc.Channels.InteropLog, (e: IpcRendererEvent, message: string) => callback(message)),
        sendCommand: (command: string) => ipcRenderer.send(Shared.Ipc.Channels.InteropSendCommand, command),
    },

    fgd: {
        build: () => ipcRenderer.invoke(Shared.Ipc.Channels.FgdBuild),
    },

    artifactCloud: {
        isConnected: () => ipcRenderer.invoke(Shared.Ipc.Channels.ArtifactCloud_IsConnected),
        listAllMaps: () => ipcRenderer.invoke(Shared.Ipc.Channels.ArtifactCloud_ListAllMaps),
        downloadMap: (artifactKey: string, mapName: string) =>
            ipcRenderer.invoke(Shared.Ipc.Channels.ArtifactCloud_DownloadMap, artifactKey, mapName),
    },

    log: {
        sendFromRenderer: (event: Shared.Log.Event) => ipcRenderer.send(Shared.Ipc.Channels.LogSendFromRenderer, event),
        subscribeSendFromMain: (callback: (logEvent: Shared.Log.Event) => void) =>
            ipcRenderer.on(Shared.Ipc.Channels.LogSendFromMain, (e: IpcRendererEvent, logEvent: Shared.Log.Event) =>
                callback(logEvent),
            ),
    },

    mdl: {
        info: (filePath: Shared.Paths.Path) => ipcRenderer.invoke(Shared.Ipc.Channels.MdlInfoGet, filePath),
    },

    vtf: {
        getInfo: (filePath: Shared.Paths.Path) => ipcRenderer.invoke(Shared.Ipc.Channels.VtfInfoQuery, filePath),
        getExtract: (filePath: Shared.Paths.Path) => ipcRenderer.invoke(Shared.Ipc.Channels.VtfExtractQuery, filePath),
    },

    task: {
        subscribeStartTask: (callback: (task: Shared.Task.Task) => void) =>
            ipcRenderer.on(Shared.Ipc.Channels.TaskStart, (e: IpcRendererEvent, task: Shared.Task.Task) =>
                callback(task),
            ),
        subscribeUpdateTask: (callback: (taskId: Shared.Task.TaskId, quantity: number) => void) =>
            ipcRenderer.on(
                Shared.Ipc.Channels.TaskUpdate,
                (e: IpcRendererEvent, taskId: Shared.Task.TaskId, quantity: number) => callback(taskId, quantity),
            ),
        subscribeEndTask: (callback: (taskId: Shared.Task.TaskId) => void) =>
            ipcRenderer.on(Shared.Ipc.Channels.TaskEnd, (e: IpcRendererEvent, taskId: Shared.Task.TaskId) =>
                callback(taskId),
            ),
        createFakeTask: () => ipcRenderer.send(Shared.Ipc.Channels.TaskCreateFake),
    },
});
