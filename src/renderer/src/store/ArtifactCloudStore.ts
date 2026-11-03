import { defineStore } from "pinia";
import { useMapListStore } from "~/store/MapListStore.js";
import * as Shared from "mod_companion_shared";

export const useArtifactCloudStore = defineStore("artifact-cloud", () => {
    const connected = ref(false);
    const mapsList = ref<Map<string, Shared.ArtifactCloud.MapInfo[]>>(new Map());
    const activeDownloads = reactive<Map<string, Promise<boolean>>>(new Map());

    async function checkAlive() {
        connected.value = await window.electronAPI.artifactCloud.isConnected();

        if (connected.value) {
            setTimeout(checkAlive, 15000);
        } else {
            setTimeout(checkAlive, 1000);
        }
    }
    checkAlive();

    async function refresh(): Promise<void> {
        const result = await window.electronAPI.artifactCloud.listAllMaps();
        if (result?.maps) {
            mapsList.value = result.maps;
        }
    }

    async function downloadMap(mapName: string, objectKey: string): Promise<boolean> {
        const promise = window.electronAPI.artifactCloud
            .downloadMap(objectKey, mapName)
            .finally(() => activeDownloads.delete(mapName));
        activeDownloads.set(mapName, promise);
        return promise;
    }

    function downloadAll(): Promise<PromiseSettledResult<boolean>[]> {
        const promises: Promise<boolean>[] = [];
        for (const map of useMapListStore().mapList) {
            const meta = mapsList.value.get(map);
            if (!meta || meta.length === 0) continue;

            promises.push(downloadMap(map, meta[0].objectKey));
        }

        return Promise.allSettled(promises);
    }

    return { connected, downloadMap, downloadAll, refresh, activeDownloads, mapsList };
});
