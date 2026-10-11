import { AppConfig } from "./SharedAppConfig.js";
import { FileEntry, FileIndexMessage } from "./SharedFileBrowser.js";
import { ImageMetaReport } from "./SharedImageMetaReport.js";
import { AssetMap } from "./SharedAsset.js";
import * as Shared from "./SharedManifest.js";

export enum WorkerFile {
    ImageMeta = "CoreImageMetaWorker",
    IndexFilesystem = "CoreIndexFilesystemWorker",
    AssetScanner = "CoreAssetScannerWorker",
    FileWatcher = "CoreFileWatcherWorker",
}

// Config Map

export type WorkerArgs = {
    [WorkerFile.ImageMeta]: ImageMetaWorkerArgs;
    [WorkerFile.IndexFilesystem]: IndexFilesystemWorkerArgs;
    [WorkerFile.AssetScanner]: AssetScannerWorkerArgs;
    [WorkerFile.FileWatcher]: FileWatcherWorkerArgs;
};

export type WorkerDoneResponses = {
    [WorkerFile.ImageMeta]: ImageMetaWorkerDoneMessage;
    [WorkerFile.IndexFilesystem]: IndexFilesystemWorkerDoneMessage;
    [WorkerFile.AssetScanner]: AssetScannerWorkerDoneMessage;
    [WorkerFile.FileWatcher]: FileWatcherDoneMessage;
};

export type WorkerPostResponses = {
    [WorkerFile.ImageMeta]: ImageMetaWorkerPostMessage;
    [WorkerFile.IndexFilesystem]: IndexFilesystemWorkerPostMessage;
    [WorkerFile.AssetScanner]: AssetScannerWorkerPostMessage;
    [WorkerFile.FileWatcher]: FileWatcherPostMessage;
};

// Incoming args

export interface AppWorkerData<TArgs> {
    args: TArgs;
    common: {
        appConfig: AppConfig;
    };
}

// Responses. Messages that the thread can send back to the parent thread

export enum ResponseType {
    Log,
    Done,
    Post,
}

export interface WorkerResponse<TType extends ResponseType, TPayload> {
    type: TType;
    payload: TPayload;
}

export type WorkerResponseLog = WorkerResponse<ResponseType.Log, Shared.Log.Event>;
export type WorkerResponseDone<TPayload> = WorkerResponse<ResponseType.Done, TPayload>;
export type WorkerResponsePost<TPayload> = WorkerResponse<ResponseType.Post, TPayload>;

export interface AppWorkerResponses<TDonePayload, TPostPayload> {
    log: {
        debug: (channel: Shared.Log.Channel, ...data: any[]) => void;
        info: (channel: Shared.Log.Channel, ...data: any[]) => void;
        warning: (channel: Shared.Log.Channel, ...data: any[]) => void;
        error: (channel: Shared.Log.Channel, ...data: any[]) => void;
    };
    done: (doneData: TDonePayload) => void;
    post: (postData: TPostPayload) => void;
}

// ---

export interface ImageMetaWorkerArgs {
    filePath: string;
}
export type ImageMetaWorkerDoneMessage = ImageMetaReport | undefined;
export interface ImageMetaWorkerPostMessage {}

// ---

export interface IndexFilesystemWorkerArgs {
    startDir: string;
}
export interface IndexFilesystemWorkerDoneMessage {}
export type IndexFilesystemWorkerPostMessage = FileIndexMessage;

// ---

export interface AssetScannerWorkerArgs {
    index: Map<string, FileEntry[]>;
}
export type AssetScannerWorkerDoneMessage = AssetMap;
export interface AssetScannerWorkerPostMessage {
    progressNow: number;
    progressTotal: number;
}

// ---

export interface FileWatcherWorkerArgs {}
export interface FileWatcherDoneMessage {}
export interface FileWatcherPostMessage {
    fileChanged?: string;
    dirUpdate?: { dir: string; entries: Shared.FileBrowser.FileEntries };
}
