import { defineStore } from "pinia";
import { configInitializedEvent } from "~/renderer-config.js";

export const useMapPresetsStore = defineStore("map-presets", () => {
    const presets = reactive<Map<string, string[]>>(new Map());

    configInitializedEvent.on((payload) => {
        if (payload.mapPresets) {
            presets.clear();
            for (const [presetName, mapPathStrings] of Object.entries(payload.mapPresets)) {
                presets.set(presetName, mapPathStrings);
            }
        }
    });

    return { presets };
});
