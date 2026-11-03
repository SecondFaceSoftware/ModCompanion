import { reactive, ref } from "vue";
import { defineStore } from "pinia";
import { useRememberRef } from "~/composables/useRemember.js";
import * as Shared from "mod_companion_shared";
import { useMapListStore } from "~/store/MapListStore.js";

export const useMapConsoleStore = defineStore("map-console", () => {
    const isOpen = useRememberRef(ref(false), "map-console-open");
    const logMap = reactive<Map<string, string>>(new Map<string, string>());
    const mapsWithLog = reactive(new Set<string>());
    const currentStep = ref<Shared.Map.CompileStep>(Shared.Map.CompileStep.VBsp);

    function toggleOpen() {
        isOpen.value = !isOpen.value;
    }

    window.electronAPI.map.subscribeCompileProgress((event) => {
        if (event.state === Shared.Map.CompileState.InProgress) {
            useMapListStore().selectMap(event.mapName);
            currentStep.value = event.step;
        }
    });

    window.electronAPI.map.subscribeCompileLog((event: Shared.Map.CompileLogEvent) => {
        const eventHash = Shared.Map.createMapPathAndStep(event.mapName, event.step);

        const existingText = logMap.get(eventHash) ?? "";
        logMap.set(eventHash, existingText + event.message);

        mapsWithLog.add(event.mapName);
    });

    function getLog(mapName: string, step: Shared.Map.CompileStep) {
        const mapHash = Shared.Map.createMapPathAndStep(mapName, step);
        return logMap.get(mapHash) ?? "";
    }

    return { isOpen, toggleOpen, logMap, currentStep, getLog, mapsWithLog };
});
