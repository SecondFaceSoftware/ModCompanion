import * as Shared from "mod_companion_shared";
import { filename } from "pathe/utils";
import { getAppConfig } from "~/renderer-config.js";
import { Logger } from "~/logger.js";

/**
 * Opens a map in the game
 * @param mapName Path to the map path, or just its name. Must be in the maps folder
 */
export function openMapInGame(mapName: string): void {
    const n = filename(mapName);
    window.electronAPI.app.launch(
        Shared.Launchers.Launchers.Game,
        `-dev -condebug -netconport ${Shared.GameInterop.NetconPort} +map ${n}`,
    );
}

export function openMapInHammer(vmfPath: Shared.Paths.Path): void {
    const absVmfPath = Shared.Paths.transformPathBase(vmfPath, Shared.Paths.PathBases.Absolute, getAppConfig());
    if (!absVmfPath) {
        Logger.warning(Shared.Log.Channel.Generic, "Failed to open map. Path failed to resolve", vmfPath);
        return;
    }

    window.electronAPI.app.launch(Shared.Launchers.Launchers.Hammer, absVmfPath.path);
}
