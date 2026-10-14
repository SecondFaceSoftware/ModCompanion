import { defineStore } from "pinia";
import { configInitializedEvent } from "~/renderer-config.js";
import * as Shared from "mod_companion_shared";

export const useMapPresetsStore = defineStore("map-presets", () => {
    const presets = reactive<Map<string, Shared.Paths.Path[]>>(new Map());

    configInitializedEvent.on((payload) => {
        if (payload.mapPresets) {
            presets.clear();
            for (const [presetName, mapPathStrings] of Object.entries(payload.mapPresets)) {
                const mapPaths = mapPathStrings.map((m) =>
                    Shared.Paths.createPath(m, Shared.Paths.PathBases.ContentMaps),
                );
                presets.set(presetName, mapPaths);
            }
        }
    });

    return { presets };
});
