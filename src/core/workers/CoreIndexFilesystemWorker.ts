import { parentPort, workerData } from "worker_threads";
import fs from "node:fs/promises";
import path from "node:path";
import * as Shared from "mod_companion_shared";

async function indexFiles(startDir: string): Promise<void> {
    async function walkFolder(dir: string, startDirLen: number): Promise<void> {
        const paths = await fs.readdir(dir);
        const entries: Shared.FileBrowser.FileEntry[] = [];

        for (const p of paths) {
            if (Shared.FileBrowser.isIgnoredPathName(p)) continue;
            const fullPath = path.join(dir, p);
            const stat = await fs.stat(fullPath);

            const resultPath = fullPath.substring(startDirLen).replaceAll("\\", "/");
            if (stat.isFile()) {
                entries.push({
                    name: p,
                    path: resultPath,
                    isFile: true,
                    fileSize: stat.size,
                });
            } else {
                entries.push({
                    name: p,
                    path: resultPath,
                    isFile: false,
                });

                await walkFolder(fullPath, startDirLen);
            }
        }

        parentPort?.postMessage({ dir: dir.substring(startDirLen), entries });
    }

    await walkFolder(startDir, startDir.length + 1);
}

indexFiles(workerData);
