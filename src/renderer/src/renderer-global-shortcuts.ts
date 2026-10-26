import { TakeOverId, useTakeOverStore } from "~/store/TakeOverStore.js";
import { useRunStore } from "~/store/RunStore.js";

export function registerGlobalShortcuts(): void {
    defineShortcuts({
        ctrl_p: () => {
            useTakeOverStore().toggle(TakeOverId.FindAnything);
        },
        f5: () => {
            useRunStore().runLastGameConfig();
        },
    });
}
