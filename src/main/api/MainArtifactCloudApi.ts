import { ipcMain } from "electron";

import * as Core from "mod_companion_core";
import * as Shared from "mod_companion_shared";

export function registerArtifactCloudApi(): boolean {
    ipcMain.handle(Shared.Ipc.Channels.ArtifactCloud_IsConnected, (): Promise<boolean> => {
        return Core.ArtifactCloudSystem.isCloudConnected();
    });
    ipcMain.handle(
        Shared.Ipc.Channels.ArtifactCloud_ListAllMaps,
        (): Promise<Shared.ArtifactCloud.ListAllMapsReport | undefined> => {
            return Core.ArtifactCloudSystem.listMaps();
        },
    );
    ipcMain.handle(
        Shared.Ipc.Channels.ArtifactCloud_DownloadMap,
        async (e, artifactKey: string, mapPath: Shared.Paths.Path): Promise<boolean> => {
            return await Core.ArtifactCloudSystem.downloadMap(artifactKey, mapPath);
        },
    );

    return true;
}
