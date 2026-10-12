import { ref } from "vue";
import { defineStore } from "pinia";
import { useEvent } from "~/composables/useEvent.js";
import { Logger } from "~/logger.js";
import * as Shared from "mod_companion_shared";
import { Channel } from "mod_companion_shared/SharedLog.js";

export const useAssetListStore = defineStore("asset-list", () => {
    const assets = ref<Shared.Asset.AssetMap>(new Map());
    const refreshing = ref(false);

    const activateEvent = useEvent<Shared.Asset.AssetId | undefined>();
    const selectEvent = useEvent<Shared.Asset.AssetId[]>();
    const writtenEvent = useEvent<Shared.Asset.AssetId[]>();

    window.electronAPI.asset.subscribeAdded((event) => {
        const newAssets = event.assets;
        if (newAssets.length === 0) return;

        for (const newAsset of newAssets) {
            assets.value.set(newAsset.def.id, newAsset);
        }
    });

    window.electronAPI.asset.subscribeUpdated((event) => {
        const newAssets = event.assets;
        for (const asset of newAssets) {
            assets.value.set(asset.def.id, asset);
        }
    });

    window.electronAPI.asset.subscribeRescanned((event) => {
        refreshing.value = false;
        assets.value = event.assets;
    });

    async function createAsset(primaryFile: string, otherFiles: string[]): Promise<Shared.Asset.Asset[]> {
        const result = await window.electronAPI.asset.createAsset(primaryFile, otherFiles);
        if (result.type === Shared.Asset.SharedCreateAssetReportType.Success) {
            for (const asset of result.assets) {
                assets.value.set(asset.def.id, asset);
            }

            return result.assets;
        } else {
            Logger.warning(Channel.Assets, "Failed to create asset");
        }

        return [];
    }

    async function deleteAsset(assetId: Shared.Asset.AssetId): Promise<boolean> {
        try {
            await window.electronAPI.asset.delete(assetId);
        } catch {
            return false;
        }

        assets.value.delete(assetId);
        return true;
    }

    async function refresh(): Promise<void> {
        console.trace("refreshed asset list");
        refreshing.value = true;
        await window.electronAPI.asset.rescan();
    }

    function activate(id: Shared.Asset.AssetId | undefined): void {
        activateEvent.call(id);
    }

    function getAssetById(id: Shared.Asset.AssetId | undefined): Shared.Asset.Asset | undefined {
        if (id === undefined) return undefined;
        return assets.value.get(id);
    }

    function getAssetsById(ids: Shared.Asset.AssetId[]): Shared.Asset.Asset[] {
        return ids.map((id) => assets.value.get(id)).filter((a) => a !== undefined);
    }

    function updateAssets(as: Shared.Asset.Asset[]): void {
        const mapCopy = new Map(assets.value);
        for (const a of as) {
            mapCopy.set(a.def.id, a);
        }
        assets.value = mapCopy;
    }

    async function writeAssets(as: Shared.Asset.Asset[]): Promise<void> {
        Logger.debug(Shared.Log.Channel.Generic, "Writing asset", as);
        const results = as.map((a) => window.electronAPI.asset.update(a.def.id, a.def));
        const newAssets = await Promise.all(results);
        const filtered = newAssets.filter((n) => n !== undefined);
        updateAssets(filtered);
        writtenEvent.call(as.map((a) => a.def.id));
    }

    return {
        assets,
        refreshing,
        createAsset,
        deleteAsset,
        writeAssets,
        getAssetById,
        getAssetsById,
        refresh,
        activate,
        activateEvent,
        selectEvent,
        writtenEvent,
    };
});
