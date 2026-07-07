import { ipcMain } from "electron";
import fs from "fs/promises";
import path from "path";

import * as Core from "mod_companion_core";
import * as Shared from "mod_companion_shared";

export function registerMapScannerApi(): boolean {
    ipcMain.handle(Shared.Ipc.Channels.MapListSourceDirs, listMapSourceDirs);
    return true;
}

export async function listMapSourceDirs(): Promise<Shared.Map.SharedMapSourceDir[]> {
    const config = Core.ConfigSystem.getAppConfig();

    if (config.mapSourceDirs === undefined || config.mapSourceDirs.length === 0) return [];

    const result = await fs.readdir(config.mapSourcePath);

    const dirs: Shared.Map.SharedMapSourceDir[] = [];
    for (const r of result) {
        const fullDirPath = pathe.join(config.mapSourcePath, r);
        const stat = await fs.stat(fullDirPath);
        if (!stat.isDirectory()) continue;
        if (!config.mapSourceDirs.includes(r)) continue;

        let dirContents = await fs.readdir(fullDirPath);
        dirContents = dirContents.filter((f) => path.extname(f) === ".vmf");
        const dir: Shared.Map.SharedMapSourceDir = {
            dirName: r,
            vmfNames: dirContents,
        };
        dirs.push(dir);
    }

    return dirs;
}
