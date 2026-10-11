import { ipcMain } from "electron";
import { IpcHelper } from "./MainApiHelper.js";
import * as Core from "mod_companion_core";
import * as Shared from "mod_companion_shared";

export const AssetRepositoryApi = {
    register(): boolean {
        ipcMain.on(Shared.Ipc.Channels.AssetForceRescan, () => {
            return Core.AssetRepositorySystem.scan();
        });

        ipcMain.handle(
            Shared.Ipc.Channels.AssetCreate,
            async (event, primaryFile: string, otherFiles: string[]): Promise<Shared.Asset.SharedCreateAssetReport> => {
                const files = [primaryFile, ...otherFiles];
                Core.Logger.info(Shared.Log.Channel.Assets, "Creating asset for files", primaryFile, otherFiles);
                const existingAsset = Core.AssetRepositorySystem.getAssetFromFiles(files);
                if (existingAsset) {
                    const allAssetFilesSet = new Set([
                        ...(existingAsset.def.gameFiles ?? []),
                        ...(existingAsset.def.contentFiles ?? []),
                    ]);
                    const filesAlreadyUsed = Array.from(allAssetFilesSet.intersection(new Set(files)));

                    Core.Logger.info(
                        Shared.Log.Channel.Assets,
                        "Asset API: Files are already used in asset. Used Files: ",
                        filesAlreadyUsed,
                        existingAsset,
                    );
                    return {
                        type: Shared.Asset.SharedCreateAssetReportType.ErrorFileAlreadyUsedInAsset,
                        filesAlreadyUsed,
                        asset: existingAsset.def.id,
                    };
                }

                try {
                    Core.Logger.info(Shared.Log.Channel.Assets, "Asset API: Files not used in any asset 👍");
                    const result = await Core.AssetRepositorySystem.createAssetsFromFiles(primaryFile, otherFiles);
                    if (!result) {
                        return {
                            type: Shared.Asset.SharedCreateAssetReportType.ErrorUnknown,
                        };
                    }
                    return { type: Shared.Asset.SharedCreateAssetReportType.Success, assets: result };
                } catch {
                    return {
                        type: Shared.Asset.SharedCreateAssetReportType.ErrorUnknown,
                    };
                }
            },
        );

        ipcMain.handle(
            Shared.Ipc.Channels.AssetCreateEmpty,
            (event, mcaBasePath: string): Promise<Shared.Asset.Asset> => {
                return Core.AssetRepositorySystem.createEmptyAsset(mcaBasePath);
            },
        );

        ipcMain.handle(Shared.Ipc.Channels.AssetDelete, (event, assetId: Shared.Asset.AssetId): Promise<boolean> => {
            return Core.AssetRepositorySystem.deleteAssetDef(assetId);
        });

        ipcMain.handle(
            Shared.Ipc.Channels.AssetUpdate,
            async (
                event,
                assetId: Shared.Asset.AssetId,
                assetDef: Shared.Asset.AssetDef,
            ): Promise<Shared.Asset.Asset | undefined> => {
                const asset = Core.AssetRepositorySystem.getAssetFromId(assetId);
                if (!asset || !asset.defFilePath) return;

                return Core.AssetRepositorySystem.writeAssetDef(assetDef, asset.defFilePath);
            },
        );

        return true;
    },
    notifyAssetsRescanned(event: Shared.Asset.AssetRescanEvent): void {
        IpcHelper.send(Shared.Ipc.Channels.AssetRescanned, event);
    },
    notifyAssetsAdded(event: Shared.Asset.AssetAddedEvent): void {
        IpcHelper.send(Shared.Ipc.Channels.AssetAdded, event);
    },
    notifyAssetsUpdated(event: Shared.Asset.AssetUpdatedEvent): void {
        IpcHelper.send(Shared.Ipc.Channels.AssetUpdated, event);
    },
    notifyNavigateToAssetId(assetId: string): void {
        IpcHelper.send(Shared.Ipc.Channels.AssetNavigateToId, assetId);
    },
};
