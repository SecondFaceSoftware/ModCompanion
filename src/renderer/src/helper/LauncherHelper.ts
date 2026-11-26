import * as Shared from "mod_companion_shared";
import { filename } from "pathe/utils";
import { getAppConfig } from "~/renderer-config.js";
import { Logger } from "~/logger.js";
import * as pathe from "pathe";

export function openMapInGame(mapName: string): void {
    const n = filename(mapName);
    window.electronAPI.app.launch(
        Shared.Launchers.Launchers.Game,
        `-dev -condebug -netconport ${Shared.GameInterop.NetconPort} +map ${n}`,
    );
}

export function openMapInHammer(mapName: string): void {
    const relativeVmfPath = Shared.Paths.createPath(mapName + ".vmf", Shared.Paths.PathBases.ContentMaps);
    const absVmfPath = Shared.Paths.transformPathBase(relativeVmfPath, Shared.Paths.PathBases.Absolute, getAppConfig());
    if (!absVmfPath) {
        Logger.warning(Shared.Log.Channel.Generic, "Failed to open map. Path failed to resolve", mapName);
        return;
    }

    window.electronAPI.app.launch(Shared.Launchers.Launchers.Hammer, absVmfPath.path);
}

export function openModelInHlmv(modelAsset: Shared.Asset.ModelAsset): boolean {
    let args = "";

    if (!modelAsset.def.gameFiles) return false;
    const mdlFilePathStr = modelAsset.def.gameFiles.find((g) => pathe.extname(g) === ".mdl");
    if (!mdlFilePathStr) return false;

    const mdlFileGameRelative = Shared.Paths.createPath(mdlFilePathStr, Shared.Paths.PathBases.Game);
    const mdlFileAbsolute = Shared.Paths.transformPathBase(
        mdlFileGameRelative,
        Shared.Paths.PathBases.Absolute,
        getAppConfig(),
    );
    if (mdlFileAbsolute) {
        args += `"${mdlFileAbsolute.path}" `;
    }

    window.electronAPI.app.launch(Shared.Launchers.Launchers.Hlmv, args);
    return true;
}
