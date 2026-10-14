import * as Shared from "mod_companion_shared";
import { Stream } from "node:stream";
import { FileEntry } from "mod_companion_shared/SharedFileBrowser.js";

export {};

declare global {
    interface Window {
        electronAPI: {
            app: {
                launch: (launcherType: Shared.Launchers.Launchers, launcherArgs: string | undefined) => void;
                exitForReal: () => void;
                closeWindow: () => void;
                minimize: () => void;
                maximize: () => void;
                unmaximize: () => void;
                toggleMaximized: () => void;
                openExternal: (payload: string) => void;
                getAppVersion: () => Promise<string>;
                rendererReady: () => void;
            };

            fileBrowser: {
                listFiles: (dirPath: string) => Promise<Shared.FileBrowser.FileEntries>;
                getFileEntry: (path: Shared.Paths.Path) => Promise<FileEntry | undefined>;
                browseTo: (path: Shared.Paths.Path) => void;

                /**
                 * Open one or more files with their default application. To execute a binaries, use launchFile
                 * @see execute
                 * */
                open: (path: Shared.Paths.Path[] | Shared.Paths.Path) => void;

                updateOpenedDirs: (dirs: string[]) => void;

                /**
                 * Launches one or more executables. To open a file with its default application, use openFile
                 * @see open
                 */
                execute: (path: Shared.Paths.Path[] | Shared.Paths.Path) => void;
                subscribeDirUpdated: (
                    callback: (dir: string, entries: Shared.FileBrowser.FileEntries) => void,
                ) => IpcRenderer;
                subscribeIndexUpdated: (
                    callback: (index: Map<string, Shared.FileBrowser.FileEntries>) => void,
                ) => IpcRenderer;
            };

            file: {
                readString: (path: Shared.Paths.Path) => Promise<string | undefined>;
                writeString: (
                    path: Shared.Paths.Path,
                    data:
                        | string
                        | NodeJS.ArrayBufferView
                        | Iterable<string | NodeJS.ArrayBufferView>
                        | AsyncIterable<string | NodeJS.ArrayBufferView>
                        | Stream,
                ) => Promise<void>;
                delete: (path: Shared.Paths.Path) => Promise<boolean>;
                exists: (path: Shared.Paths.Path) => Promise<boolean>;
            };

            config: {
                get: () => Promise<Shared.AppConfig.AppConfig>;
            };

            map: {
                listSourceDirs: () => Promise<Shared.Map.SharedMapSourceDir[]>;
                enqueue: (mapPaths: Shared.Paths.Path[]) => void;
                subscribeQueueUpdated: (callback: (queue: Shared.Paths.Path[]) => void) => IpcRenderer;
                cancelQueue: () => void;
                pauseQueue: (paused: boolean) => void;
                subscribeCompileLog: (callback: (event: Shared.Map.CompileLogEvent) => void) => IpcRenderer;
                subscribeCompileProgress: (callback: (event: Shared.Map.CompileProgressEvent) => void) => IpcRenderer;
                createTimeReport: (mapPaths: Shared.Paths.Path[]) => Promise<Shared.Map.TimeReport>;
            };

            asset: {
                rescan: () => void;
                subscribeRescanned: (callback: (event: Shared.Asset.AssetRescanEvent) => void) => IpcRenderer;
                subscribeAdded: (callback: (event: Shared.Asset.AssetAddedEvent) => void) => IpcRenderer;
                subscribeUpdated: (callback: (event: Shared.Asset.AssetUpdatedEvent) => void) => IpcRenderer;
                subscribeNavigateToHash: (callback: (assetHash: string) => void) => IpcRenderer;
                createAsset: (
                    primaryFile: string,
                    otherFiles: string[],
                ) => Promise<Shared.Asset.SharedCreateAssetReport>;
                createEmpty: (mcaFilePath: string) => Promise<Shared.Asset.SharedCreateAssetReport>;
                update: (
                    assetId: Shared.Asset.AssetId,
                    assetDef: Shared.Asset.AssetDef,
                ) => Promise<Shared.Asset.Asset | undefined>;
                delete: (assetId: Shared.Asset.AssetId) => Promise<boolean>;
            };

            assetGroups: {
                forceRescan: () => void;
                subscribeRescanned: (callback: (event: Shared.AssetGroup.RescanEvent) => void) => IpcRenderer;
                create: (groupDef: Shared.AssetGroup.GroupDefinition) => Promise<Shared.AssetGroup.SharedAssetGroup>;
                update: (
                    groupId: Shared.AssetGroup.GroupId,
                    groupDef: Shared.AssetGroup.GroupDefinition,
                ) => Promise<Shared.AssetGroup.SharedAssetGroup>;
                delete: (groupId: Shared.AssetGroup.GroupId) => void;
            };

            image: {
                getMeta: (imageFilePath: string) => Promise<Shared.ImageMeta.ImageMetaReport | undefined>;
            };

            conversion: {
                enqueue: (assetId: Shared.Asset.AssetId) => void;
                enqueueAll: () => void;
                startAgent: () => void;
                stopAgent: () => void;
                subscribeUpdated: (callback: (event: Shared.Conversion.UpdateEvent) => void) => IpcRenderer;
                getState: () => Promise<Shared.Conversion.SharedConversionGetStateIpcReport>;
                clearEvents: () => void;
            };

            hotReload: {
                setEnabled: (enable: boolean) => void;
            };

            webUtils: {
                getPathForFile: (file: File) => string;
            };

            clipboard: {
                writeText: (text: string, type?: "selection" | "clipboard") => void;
            };

            interop: {
                subscribeConnected: (callback: () => void) => IpcRenderer;
                subscribeDisconnected: (callback: () => void) => IpcRenderer;
                subscribeLog: (callback: (message: string) => void) => IpcRenderer;
                sendCommand: (command: string) => void;
            };

            fgd: {
                build: () => Promise<boolean>;
            };

            artifactCloud: {
                isConnected: () => Promise<boolean>;
                listAllMaps: () => Promise<Shared.ArtifactCloud.ListAllMapsReport | undefined>;
                downloadMap: (artifactKey: string, mapPath: Shared.Paths.Path) => Promise<boolean>;
            };

            log: {
                sendFromRenderer: (event: Shared.Log.Event) => void;
                subscribeSendFromMain: (callback: (event: Shared.Log.Event) => void) => IpcRenderer;
            };

            mdl: {
                info: (filePath: Shared.Paths.Path) => Promise<Shared.MdlInfo.SharedMdlInfoReport>;
            };

            vtf: {
                getInfo: (filePath: Shared.Paths.Path) => Promise<Shared.Vtf.SharedVtfInfo | undefined>;
                getExtract: (filePath: Shared.Paths.Path) => Promise<string>;
            };

            task: {
                subscribeStartTask: (callback: (task: Shared.Task.Task) => void) => void;
                subscribeUpdateTask: (callback: (taskId: Shared.Task.TaskId, quantity: number) => void) => void;
                subscribeEndTask: (callback: (taskId: Shared.Task.TaskId) => void) => void;
                createFakeTask: () => void;
            };
        };
    }
}
