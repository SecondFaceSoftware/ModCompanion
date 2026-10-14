<template>
    <UPopover v-model:open="open">
        <UButton label="Presets" :disabled="Object.entries(presetsStore.presets).length === 0" />

        <template #content>
            <div class="p-2 grid gap-1">
                <UButton
                    v-for="[name, maps] in presetsStore.presets"
                    :key="name"
                    class="grid grid-cols-3 items-start text-start"
                    @click="handleClickPreset(maps)"
                >
                    <div class="text-sm col-span-full">{{ name }}</div>
                    <MapPresetList :maps="maps" />
                </UButton>
            </div>
        </template>
    </UPopover>
</template>

<script setup lang="ts">
import { useMapPresetsStore } from "~/store/MapPresetsStore.js";
import { useMapListStore } from "~/store/MapListStore.js";
import * as Shared from "mod_companion_shared";

const listStore = useMapListStore();
const presetsStore = useMapPresetsStore();

const open = ref(false);

function handleClickPreset(mapPaths: Shared.Paths.Path[]) {
    listStore.mapList = mapPaths;
    open.value = false;
}
</script>

<style scoped></style>
