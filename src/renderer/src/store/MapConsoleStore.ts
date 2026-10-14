import { reactive, ref } from "vue";
import { defineStore } from "pinia";
import { useRememberRef } from "~/composables/useRemember.js";
import * as Shared from "mod_companion_shared";
import { useMapListStore } from "~/store/MapListStore.js";

export const useMapConsoleStore = defineStore("map-console", () => {
    const isOpen = useRememberRef(ref(false), "map-console-open");
    const logMap = reactive<Map<string, string>>(new Map<string, string>());
    const mapsWithLog = reactive(new Set<Shared.Paths.Path>());
    const currentStep = ref<Shared.Map.CompileStep>(Shared.Map.CompileStep.VBsp);

    function toggleOpen() {
        isOpen.value = !isOpen.value;
    }

    window.electronAPI.map.subscribeCompileProgress((event) => {
        if (event.state === Shared.Map.CompileState.InProgress) {
            useMapListStore().selectMap(event.mapPath);
            currentStep.value = event.step;
        }
    });

    window.electronAPI.map.subscribeCompileLog((event: Shared.Map.CompileLogEvent) => {
        const eventHash = event.mapPath.path + event.mapPath.base + String(event.step);

        const existingText = logMap.get(eventHash) ?? "";
        logMap.set(eventHash, existingText + event.message);
        mapsWithLog.add(event.mapPath);
    });

    function getLog(map: Shared.Paths.Path, step: Shared.Map.CompileStep) {
        const mapHash = map.path + map.base + String(step);
        return logMap.get(mapHash) ?? "";
    }

    return { isOpen, toggleOpen, logMap, currentStep, getLog, mapsWithLog };
});
