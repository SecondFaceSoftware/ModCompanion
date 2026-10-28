<template>
    <UDropdownMenu
        :items="itemsAssets"
        size="sm"
        :ui="{ content: 'min-w-40' }"
        :content="{
            align: 'start',
        }"
    >
        <UButton size="sm" label="Assets" variant="link" />
    </UDropdownMenu>
</template>

<script setup lang="ts">
import { useRememberRef } from "~/composables/useRemember.js";
import { DropdownMenuItem } from "@nuxt/ui/components/DropdownMenu.vue.js";
import { AppDesign } from "~/design/AppDesign.js";
import { TakeOverId, useTakeOverStore } from "~/store/TakeOverStore.js";
import { useAssetConversionStore } from "~/store/AssetConversionStore.js";

const hotReloadEnabled = useRememberRef(ref(true), "hot-reload-enabled");
window.electronAPI.hotReload.setEnabled(hotReloadEnabled.value);
watch(hotReloadEnabled, (on) => {
    window.electronAPI.hotReload.setEnabled(on);
});

const itemsAssets = computed<DropdownMenuItem[][]>(() => [
    [
        // MC-33
        // {
        //     label: "Create Asset",
        //     icon: AppDesign.Icons.ActionAdd,
        //     onSelect(e: Event) {
        //         useTakeOverStore().open(TakeOverId.AssetWizard);
        //     },
        // },
        {
            label: "Convert All",
            icon: AppDesign.Icons.ActionConvertAsset,
            onSelect(e: Event) {
                useAssetConversionStore().enqueueAll();
            },
        },
        {
            label: "Auto Hot Reload",
            type: "checkbox" as const,
            icon: "empty",
            checked: hotReloadEnabled.value,
            onUpdateChecked(checked) {
                hotReloadEnabled.value = checked;
            },
            onSelect(e: Event) {
                e.preventDefault();
            },
        },
    ],
]);
</script>

<style scoped></style>
