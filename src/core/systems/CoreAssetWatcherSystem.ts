import chokidar, { FSWatcher } from "chokidar";
import { ConversionAgentSystem } from "./conversion/CoreConversionAgentSystem.js";
import { ConfigSystem } from "./CoreConfigSystem.js";
import { Logger } from "./CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import { AssetRepositorySystem } from "./asset/CoreAssetRepositorySystem.js";
import { getContentRelativePath } from "../helpers/CoreSourceFs.js";

const ignoreMap: Map<string, number> = new Map();
let watcher: FSWatcher | undefined = undefined;

let notifyFunc: Shared.Asset.AssetUpdatedNotifyFunc | undefined = undefined;

export const AssetWatcherSystem = {
    initSystem(func?: Shared.Asset.AssetUpdatedNotifyFunc) {
        notifyFunc = func;
        return AssetWatcherSystem.startFileWatcher();
    },
    startFileWatcher(): boolean {
        const config = ConfigSystem.getAppConfig();
        watcher = chokidar.watch(config.textureSourcePath, { ignoreInitial: true, awaitWriteFinish: true });

        // watcher.on("add", _handleAdded);
        watcher.on("change", _handleChanged);
        // watcher.on("unlink", _handleDeleted);

        return true;
    },
    ignore(filePath: string, ignoreCount = 1) {
        ignoreMap.set(filePath, ignoreCount);
    },
};

function _handleChanged(filePathRaw: string): void {
    const filePath = Shared.SourceFs.forwardSlashed(filePathRaw);
    const ignoreCount = ignoreMap.get(filePath);
    if (ignoreCount !== undefined && ignoreCount > 0) {
        ignoreMap.set(filePathRaw, ignoreCount - 1);
        return;
    }
    const relativePath = getContentRelativePath(filePath);
    const asset = AssetRepositorySystem.getAssetFromFile(relativePath);
    if (!asset) return;

    Logger.info(Shared.Log.Channel.Assets, "Asset files changed", asset.def.displayName, filePath);
    notifyFunc?.({ assets: [asset] });
    ConversionAgentSystem.enqueue(asset.def.id);
}
