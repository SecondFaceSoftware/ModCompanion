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

const mapList = computed(() =>
    mapFileEntries.state.value.valid
        ? mapFileEntries.state.value.entries
              .filter((e) => e.isFile && pathe.extname(e.name))
              .map((e) => filename(e.name) ?? e.name)
        : [],
);

const items = computed(() => {
    const menu: DropdownMenuItem[] = [
        {
            label: "Add All",
            onSelect() {
                listStore.addMapsAndSort(mapList.value);
            },
        },
        { type: "separator" },
    ];

    for (const mapName of mapList.value) {
        const item: DropdownMenuItem = {
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
        menu.push(item);
    }

    return menu;
});
</script>

<style scoped></style>
