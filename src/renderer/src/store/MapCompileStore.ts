import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useMapListStore } from "~/store/MapListStore.js";
import * as Shared from "mod_companion_shared";

export const useMapCompileStore = defineStore("map-compile", () => {
    const state = ref<Shared.PlayPauseStop.State>(Shared.PlayPauseStop.State.Stopped);
    const progress = reactive(new Map<string, Shared.Map.CompileState>());

    function compileNow(mapName: string) {
        if (state.value !== Shared.PlayPauseStop.State.Stopped) return;

        window.electronAPI.map.enqueue([toRaw(mapName)]);
    }

    window.electronAPI.map.subscribeCompileProgress((event) => {
        progress.set(Shared.Map.createMapPathAndStep(event.mapName, event.step), event.state);
    });

    watch(state, (newState, oldState) => {
        if (newState === Shared.PlayPauseStop.State.Stopped) {
            window.electronAPI.map.cancelQueue();
        } else if (newState === Shared.PlayPauseStop.State.Playing) {
            if (oldState === Shared.PlayPauseStop.State.Paused) {
                window.electronAPI.map.pauseQueue(false);
            } else {
                const mapList = useMapListStore().mapList;
                window.electronAPI.map.enqueue(toRaw(mapList));
                progress.clear();
            }
        } else if (newState === Shared.PlayPauseStop.State.Paused) {
            window.electronAPI.map.pauseQueue(true);
        }
    });

    return { state, compileNow, progress };
});
