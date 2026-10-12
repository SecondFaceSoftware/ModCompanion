<template>
    <UDropdownMenu
        :items="itemsTools"
        size="sm"
        :ui="{ content: 'min-w-40' }"
        :content="{
            align: 'start',
        }"
    >
        <template #fgd-leading>
            <UIcon :name="fgdIcon" :class="{ 'animate-spin': fgdStore.building }" />
        </template>
        <UButton size="sm" label="Tools" variant="link" />
    </UDropdownMenu>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import { DropdownMenuItem } from "@nuxt/ui/components/DropdownMenu.vue.js";
import { useFgdStore } from "~/store/FgdStore.js";
import { getAppConfig } from "~/renderer-config.js";
import * as Shared from "mod_companion_shared";
import { TakeOverId, useTakeOverStore } from "~/store/TakeOverStore.js";

const fgdStore = useFgdStore();
const takeOverStore = useTakeOverStore();

const fgdIcon = computed(() => {
    if (fgdStore.building) {
        return AppDesign.Icons.Loading;
    }
    if (fgdStore.result === true) {
        return AppDesign.Icons.Check;
    }
    if (fgdStore.result === false) {
        return AppDesign.Icons.Close;
    }

    return AppDesign.Icons.ActionPlay;
});

const itemsTools = computed<DropdownMenuItem[][]>(() => [
    [
        {
            label: "Open Directory",
            children: [
                {
                    label: "Project Root",
                    onSelect() {
                        window.electronAPI.fileBrowser.browseTo(
                            Shared.Paths.createPath("", Shared.Paths.PathBases.Root),
                        );
                    },
                },
            ],
        },
        {
            label: "Build FGD",
            slot: "fgd",
            onSelect(e) {
                e.preventDefault();
                fgdStore.buildFgd();
            },
        },
        {
            type: "separator",
        },
        {
            label: "Developer Tools",
            onSelect(e) {
                takeOverStore.open(TakeOverId.DevTools);
            },
        },
    ],
]);
</script>

<style scoped></style>
