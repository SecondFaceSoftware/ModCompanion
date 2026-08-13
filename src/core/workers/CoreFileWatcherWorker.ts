import { useWorkerThreadData, useWorkerThreadResponse } from "../helpers/CoreWorkerHelper.js";
import * as Shared from "mod_companion_shared";
import * as pathe from "pathe";
import chokidar, { FSWatcher } from "chokidar";
import { Logger } from "../systems/CoreLogSystem.js";
import worker_threads from "node:worker_threads";
import fs from "fs/promises";

const data = useWorkerThreadData<typeof Shared.Workers.WorkerFile.FileWatcher>();
const messages = useWorkerThreadResponse<typeof Shared.Workers.WorkerFile.FileWatcher>();

worker_threads.parentPort?.on("message", (message) => {
    if (Array.isArray(message)) {
        const files: string[] = [];
        for (const m of message) {
            if (typeof m === "string") {
                files.push(m);
            }
        }

        _recreateWatcher(files);
    }
});

let watcher: FSWatcher | undefined;

// ----------------

let alwaysWatcher: FSWatcher | undefined = undefined;
const alwaysWatchedPaths = [
    data.common.appConfig.textureOutputPath,
    pathe.join(data.common.appConfig.scriptsPath, Shared.FileNames.chamberSignConfig),
];

for (const p of alwaysWatchedPaths) {
    Logger.info(Shared.Log.Channel.FileBrowser, "Registering always watched path", p);
}

alwaysWatcher = chokidar.watch(alwaysWatchedPaths, { ignoreInitial: true, awaitWriteFinish: true });
alwaysWatcher.on("add", _add);
alwaysWatcher.on("change", _change);
alwaysWatcher.on("unlink", _delete);

// ----------------

async function _change(filePath: string): Promise<void> {
    messages.log.info(Shared.Log.Channel.FileBrowser, "CHANGED", filePath);
    return _sendUpdate(filePath);
}

async function _delete(filePath: string): Promise<void> {
    messages.log.info(Shared.Log.Channel.FileBrowser, "DELETED", filePath);
    return _sendUpdate(filePath);
}

async function _add(filePath: string): Promise<void> {
    messages.log.info(Shared.Log.Channel.FileBrowser, "ADDED", filePath);
    return _sendUpdate(filePath);
}

async function _sendUpdate(filePath: string) {
    const dir = pathe.dirname(filePath);

    const result = await listFiles(dir);

    let finalDir = dir.substring(data.common.appConfig.rootPath.length + 1);
    if (!finalDir) {
        finalDir = "/";
    }

    messages.post({ fileChanged: filePath, dirUpdate: { dir: finalDir, entries: result } });
}

async function _recreateWatcher(dirs: string[]) {
    if (watcher) {
        await watcher.close();
    }
    if (dirs.length === 0) return;

    const rootPath = data.common.appConfig.rootPath;
    const fullDirs = dirs.map((d) => pathe.join(rootPath, d));
    const timeStart = new Date().getTime();

    const fullDirsConcat = fullDirs.join(", ");
    messages.log.info(Shared.Log.Channel.FileBrowser, "Watching", fullDirsConcat);

    watcher = chokidar.watch(fullDirs, {
        ignoreInitial: true,
        awaitWriteFinish: true,
        depth: 0,
    });

    watcher.on("add", _add);
    watcher.on("change", _change);
    watcher.on("unlink", _delete);
    watcher.on("ready", () => {
        const timeEnd = new Date().getTime();
        const durationMillis = timeEnd - timeStart;
        messages.log.info(
            Shared.Log.Channel.FileBrowser,
            "File watcher for",
            fullDirsConcat,
            "ready in",
            durationMillis,
            "ms",
        );
    });
}

// TODO: Figure out how to share nodejs code. This is duplicated from CoreFileBrowserSystem.ts
async function listFiles(dirPath: string, resultBaseRoot?: string): Promise<Shared.FileBrowser.FileEntries> {
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
}
