<template>
    <UDropdownMenu :items="items" :content="{ align: 'start' }">
        <UButton label="Add" :icon="AppDesign.Icons.ActionAdd" />
    </UDropdownMenu>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import { filename } from "pathe/utils";
import * as pathe from "pathe";
import { DropdownMenuItem } from "@nuxt/ui/components/DropdownMenu.vue.js";
import { useMapListStore } from "~/store/MapListStore.js";
import { useAsyncState } from "@vueuse/core";

const listStore = useMapListStore();

const mapFileEntries = useAsyncState(window.electronAPI.fileBrowser.listFiles("content/revolution/maps"), {
    valid: false,
    entries: [],
});

const items = computed(() => {
    if (!mapFileEntries.state.value.valid) return [];

    const menu = mapFileEntries.state.value.entries
        .filter((d) => d.isFile && pathe.extname(d.name) === ".vmf")
        .map<DropdownMenuItem>((d) => {
            const mapName = filename(d.name) ?? d.name;
            return {
                label: mapName,
                type: "checkbox",
                checked: listStore.isMapInList(mapName),
                onUpdateChecked(checked: boolean) {
                    if (checked) {
                        listStore.addMap(mapName);
                    } else {
                        listStore.removeMap(mapName);
                    }
                },
            };
        });

    return menu;
});
</script>

<style scoped></style>
