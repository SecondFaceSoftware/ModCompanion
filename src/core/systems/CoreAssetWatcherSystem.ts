import chokidar, { FSWatcher } from "chokidar";
import { ConversionAgentSystem } from "./conversion/CoreConversionAgentSystem.js";
import { ConfigSystem } from "./CoreConfigSystem.js";
import { Logger } from "./CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import { AssetRepositorySystem } from "./asset/CoreAssetRepositorySystem.js";
import { getContentRelativePath } from "../helpers/CoreSourceFs.js";

// Ignore list for asset file updates.
// When an asset is converted, the source files are touched, causing a file change event to occur which must be ignored
// This maps root relative file paths to the amount of times their changes should be ignored
const ignoreMap: Map<string, number> = new Map();
let watcher: FSWatcher | undefined = undefined;

let notifyFunc: Shared.Asset.AssetUpdatedNotifyFunc | undefined = undefined;

export const AssetWatcherSystem = {
    initSystem(func?: Shared.Asset.AssetUpdatedNotifyFunc) {
        notifyFunc = func;
        return AssetWatcherSystem.startFileWatchers();
    },
    startFileWatchers(): boolean {
        const config = ConfigSystem.getAppConfig();

        const pathsToWatch = [config.textureSourcePath, config.modelSourcePath];
        watcher = chokidar.watch(pathsToWatch, { ignoreInitial: true, awaitWriteFinish: true });

        watcher.on("add", _handleChanged); // do the same thing as if the file was changed
        watcher.on("change", _handleChanged);

        return true;
    },
    ignore(filePath: string, ignoreCount = 1) {
        ignoreMap.set(filePath, ignoreCount);
    },
};

function _handleChanged(filePathRaw: string): void {
    const filePath = Shared.SourceFs.forwardSlashed(filePathRaw);

    // is this asset on the ignore list?
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
