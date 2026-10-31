import * as Shared from "mod_companion_shared";
import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useRememberArray, useRememberWorkspaceRef } from "~/composables/useRemember.js";
import { useFilter } from "~/composables/useFilter.js";
import { useMapDisplayNames } from "~/composables/useMapDisplayNames.js";

export const useMapListStore = defineStore("map-list", () => {
    const mapList = useRememberArray(ref<Shared.Paths.Path[]>([]), "map-list");
    const searchTerm = useRememberWorkspaceRef(ref<string>(""), "map-search");
    const filteredMapList = useFilter(mapList, (item) => item.path.toLowerCase(), searchTerm);
    const selectedMap = ref<Shared.Paths.Path | undefined>();
    const mapQueue = ref<Shared.Paths.Path[]>([]);
    const mapDisplayList = computed(() => useMapDisplayNames(mapList.value));

    // Pass undefined to deselect
    function selectMap(mapPath: Shared.Paths.Path | undefined) {
        selectedMap.value = mapPath;
    }

    function isMapInList(mapPath: Shared.Paths.Path): boolean {
        for (const mapListItem of mapList.value) {
            if (Shared.Paths.isEqual(mapListItem, mapPath)) {
                return true;
            }
        }
        return false;
    }

    function addMap(mapPath: Shared.Paths.Path): void {
        if (!isMapInList(mapPath)) {
            mapList.value.push(mapPath);
        }
    }

    function removeMap(mapPath: Shared.Paths.Path): void {
        const idx = mapList.value.indexOf(mapPath);
        if (idx < 0) return;

        mapList.value.splice(idx, 1);
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
        mapDisplayList,
    };
});
