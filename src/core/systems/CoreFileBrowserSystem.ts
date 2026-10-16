import { ConfigSystem } from "./CoreConfigSystem.js";
import * as pathe from "pathe";
import fs from "fs/promises";
import { Logger } from "./CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import { createEvent } from "../helpers/CoreEventHelper.js";
import { WorkerSystem } from "./CoreWorkerSystem.js";
import worker_threads from "node:worker_threads";

const index: Map<string, Shared.FileBrowser.FileEntry[]> = new Map();

function _handleIndexMessage(result: Shared.FileBrowser.FileIndexMessage) {
    const dir = Shared.SourceFs.forwardSlashed(result.dir);
    index.set(dir, result.entries);
    dirUpdatedNotifyFunc?.(dir, { entries: result.entries, valid: true });
}

let fileWatcherWorker: worker_threads.Worker | undefined = undefined;

const indexDoneEvent = createEvent<Map<string, Shared.FileBrowser.FileEntry[]>>();
const fileChangedEvent = createEvent<Shared.Paths.Path>();
let dirUpdatedNotifyFunc: Shared.FileBrowser.DirUpdatedNotifyFunc | undefined = undefined;

export const FileBrowserSystem = {
    initSystem(notifyFunc?: Shared.FileBrowser.DirUpdatedNotifyFunc, noWatchers = false) {
        dirUpdatedNotifyFunc = notifyFunc;
        this.indexFiles();

        if (!noWatchers) {
            fileWatcherWorker = WorkerSystem.createWorker(
                Shared.Workers.WorkerFile.FileWatcher,
                {},
                undefined,
                (payload) => {
                    if (payload.fileChanged) {
                        fileChangedEvent.call(
                            Shared.Paths.createPath(payload.fileChanged, Shared.Paths.PathBases.Root),
                        );
                    }
                    if (payload.dirUpdate) {
                        dirUpdatedNotifyFunc?.(payload.dirUpdate.dir, payload.dirUpdate.entries);
                    }
                },
            );
        }

        return true;
    },

    getFileChangedEvent() {
        return fileChangedEvent;
    },

    getIndexDoneEvent() {
        return indexDoneEvent;
    },

    async updateOpenedDirs(dirs: string[]) {
        fileWatcherWorker?.postMessage(dirs);
    },

    getIndex(): Map<string, Shared.FileBrowser.FileEntry[]> {
        return index;
    },

    async listFiles(dirPath: string, resultBaseRoot?: string): Promise<Shared.FileBrowser.FileEntries> {
        let paths: string[] = [];
        try {
            paths = await fs.readdir(dirPath);
        } catch (e) {
            return { valid: false, entries: [] };
        }
        const entries: Shared.FileBrowser.FileEntry[] = [];

        for (const p of paths) {
            if (Shared.FileBrowser.isIgnoredPathName(p)) continue;

            try {
                const s = await fs.stat(pathe.join(dirPath, p));
                const entryPath = Shared.SourceFs.forwardSlashed(pathe.join(resultBaseRoot ?? dirPath, p));
                if (s.isFile()) {
                    entries.push({
                        name: p,
                        path: entryPath,
                        isFile: true,
                        fileSize: s.size,
                    });
                } else {
                    entries.push({
                        name: p,
                        path: entryPath,
                        isFile: false,
                    });
                }
            } catch {
                // Error is expected so don't print or throw.
                // Windows returns garbage paths that we can't read so just skip them
                // Like "System Volume Information", which exists when using the P:/ drive alias on the repo root
            }
        }

        return { entries, valid: true };
    },

    indexFiles() {
        Logger.info(Shared.Log.Channel.FileBrowser, "Indexing files...");
        const timeStart = Date.now();
        const worker = WorkerSystem.createWorker(
            Shared.Workers.WorkerFile.IndexFilesystem,
            {
                startDir: ConfigSystem.getAppConfig().rootPath,
            },
            undefined,
            _handleIndexMessage,
        );
        worker.on("exit", () => {
            const timeEnd = Date.now();
            const totalEntries = index.values().reduce((sum, a) => sum + a.length, 0);
            Logger.info(
                Shared.Log.Channel.FileBrowser,
                "Indexing done. Found",
                totalEntries,
                "entries in",
                index.size,
                "directories. Took",
                timeEnd - timeStart,
                "ms",
            );
            indexDoneEvent?.call(index);
        });
    },
};
