<template>
    <UDropdownMenu :items="items" :content="{ align: 'start' }">
        <UButton label="Add" :icon="AppDesign.Icons.ActionAdd" />
    </UDropdownMenu>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import { filename } from "pathe/utils";
import { DropdownMenuItem } from "@nuxt/ui/components/DropdownMenu.vue.js";
import { useMapListStore } from "~/store/MapListStore.js";
import * as pathe from "pathe";
import * as Shared from "mod_companion_shared";

const listStore = useMapListStore();

const mapDirs = ref<Shared.Map.SharedMapSourceDir[]>([]);

window.electronAPI.map.listSourceDirs().then((value) => (mapDirs.value = value));

const items = computed(() => {
    const menu = mapDirs.value.map<DropdownMenuItem>((d) => ({
        label: d.dirName,
        children: d.vmfNames.map<DropdownMenuItem>((m) => {
            const fullPathStr = pathe.join(d.dirName, m);
            const fullPath = Shared.Paths.createPath(fullPathStr, Shared.Paths.PathBases.ContentMaps);
            return {
                label: filename(m),
                type: "checkbox",
                checked: listStore.isMapInList(fullPath),
                onUpdateChecked(checked: boolean) {
                    if (checked) {
                        listStore.addMap(fullPath);
                    } else {
                        listStore.removeMap(fullPath);
                    }
                },
            };
        }),
    }));

    return menu;
});
</script>

<style scoped></style>
