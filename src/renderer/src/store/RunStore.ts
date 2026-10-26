import { defineStore } from "pinia";
import { useRememberRef } from "~/composables/useRemember.js";
import * as Shared from "mod_companion_shared";

export const useRunStore = defineStore("run-store", () => {
    const lastRunGameConfig = useRememberRef(ref<number>(1), "last-run-game-config-idx");

    function runLastGameConfig() {
        const idx = Math.max(0, Math.min(lastRunGameConfig.value, Shared.Launchers.GameLauncherOptions.length - 1));
        const option = Shared.Launchers.GameLauncherOptions[idx];
        window.electronAPI.app.launch(option.type, option.args);
    }

    return { lastRunGameConfig, runLastGameConfig };
});
