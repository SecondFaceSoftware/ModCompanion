import { useRunStore } from "~/store/RunStore.js";

export function registerGlobalShortcuts(): void {
    defineShortcuts({
        // MC-54 Stubs for find anything feature
        // ctrl_p: () => {
        //     useTakeOverStore().toggle(TakeOverId.FindAnything);
        // },
        f6: () => {
            useRunStore().runLastGameConfig();
        },
    });
}
