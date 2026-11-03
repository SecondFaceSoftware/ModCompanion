import { ref } from "vue";
import { defineStore } from "pinia";
import { useRememberArray, useRememberWorkspaceRef } from "~/composables/useRemember.js";
import { useFilter } from "~/composables/useFilter.js";

export const useMapListStore = defineStore("map-list", () => {
    const mapList = useRememberArray(ref<string[]>([]), "map-list");
    const searchTerm = useRememberWorkspaceRef(ref<string>(""), "map-search");
    const filteredMapList = useFilter(mapList, (item) => item.toLowerCase(), searchTerm);
    const selectedMap = ref<string | undefined>();
    const mapQueue = ref<string[]>([]);

    // Pass undefined to deselect
    function selectMap(mapName: string | undefined) {
        selectedMap.value = mapName;
    }

    function isMapInList(mapName: string): boolean {
        return mapList.value.includes(mapName);
    }

    function addMap(mapName: string): void {
        if (!isMapInList(mapName)) {
            mapList.value = [...mapList.value, mapName];
        }
    }

    function removeMap(mapName: string): void {
        const idx = mapList.value.indexOf(mapName);
        if (idx < 0) return;

        const mapListCopy = mapList.value;
        mapListCopy.splice(idx, 1);
        mapList.value = mapListCopy;
    }

    window.electronAPI.map.subscribeQueueUpdated((arg) => {
        mapQueue.value = arg;
    });

    return {
        mapList,
        filteredMapList,
        searchTerm,
        selectedMap,
        mapQueue,
        addMap,
        removeMap,
        isMapInList,
        selectMap,
    };
});
