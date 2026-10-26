import { defineStore } from "pinia";
import { AppDesign } from "~/design/AppDesign.js";
import MessageLogTakeOver from "~/components/takeovers/MessageLogTakeOver.vue";
import AssetWizardTakeOver from "~/components/takeovers/AssetWizardTakeOver.vue";
import DevToolsTakeOver from "~/components/takeovers/DevToolsTakeOver.vue";
import FindAnythingTakeOver from "~/components/takeovers/FindAnythingTakeOver.vue";

export enum TakeOverId {
    MessageLog,
    AssetWizard,
    DevTools,
    FindAnything,
}

interface TakeOverDef {
    name: string;
    icon: string;
    component: Component;
}

export const TakeOverConfig: Record<TakeOverId, TakeOverDef> = {
    [TakeOverId.MessageLog]: {
        name: "Message Log",
        icon: AppDesign.Icons.TakeOver_Log,
        component: MessageLogTakeOver,
    },
    [TakeOverId.AssetWizard]: {
        name: "Create Asset",
        icon: AppDesign.Icons.TakeOver_AssetWizard,
        component: AssetWizardTakeOver,
    },
    [TakeOverId.DevTools]: {
        name: "Developer Tools",
        icon: AppDesign.Icons.TakeOver_DevTools,
        component: DevToolsTakeOver,
    },
    [TakeOverId.FindAnything]: {
        name: "Find Anything",
        icon: AppDesign.Icons.TakeOver_FindAnything,
        component: FindAnythingTakeOver,
    },
} as const;

export const useTakeOverStore = defineStore("takeover", () => {
    const openTakeOver = ref<TakeOverId | undefined>(undefined);

    function isOpen(takeOver: TakeOverId): boolean {
        return openTakeOver.value === takeOver;
    }

    function close(): void {
        openTakeOver.value = undefined;
    }

    function open(takeOver: TakeOverId): void {
        openTakeOver.value = takeOver;
    }

    function toggle(takeOver: TakeOverId): void {
        if (isOpen(takeOver)) {
            close();
        } else {
            open(takeOver);
        }
    }

    return { openTakeOver, isOpen, close, open, toggle };
});
