<template>
    <UButtonGroup class="my-0.5">
        <UTooltip text="Compile Now">
            <UButton
                :icon="AppDesign.Icons.ActionCompileMap"
                :disabled="hasQueue"
                @click="() => compileStore.compileNow(mapPath)"
            />
        </UTooltip>
        <MapsDataGridActionCloudButton v-if="artifactCloudStore.connected" :map-path="mapPath" :disabled="hasQueue" />
        <UTooltip text="Open in Hammer">
            <UButton @click="handleOpenInHammer">
                <template #leading>
                    <MBitmapIcon :name="AppDesign.BitmapIcon.Launchers.hammer" />
                </template>
            </UButton>
        </UTooltip>
        <UTooltip text="Open in Game">
            <UButton @click="() => openMapInGame(mapPath.path)">
                <template #leading>
                    <MBitmapIcon :name="AppDesign.BitmapIcon.Launchers.game" />
                </template>
            </UButton>
        </UTooltip>
        <UTooltip text="Remove from list">
            <UButton
                :icon="AppDesign.Icons.ActionRemove"
                :disabled="hasQueue"
                @click="() => listStore.removeMap(mapPath)"
            />
        </UTooltip>
        <UDropdownMenu :items="dropdownItems">
            <UButton :icon="AppDesign.Icons.EllipsisVertical" />
        </UDropdownMenu>
    </UButtonGroup>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useMapCompileStore } from "~/store/MapCompileStore.js";
import { useMapListStore } from "~/store/MapListStore.js";
import { DropdownMenuItem } from "@nuxt/ui/components/DropdownMenu.vue.js";
import { AppDesign } from "~/design/AppDesign.js";
import MapsDataGridActionCloudButton from "~/components/panels/maps/list/MapsDataGridActionCloudButton.vue";
import { openMapInGame, openMapInHammer } from "~/helper/LauncherHelper.js";
import { useArtifactCloudStore } from "~/store/ArtifactCloudStore.js";
import * as Shared from "mod_companion_shared";

const compileStore = useMapCompileStore();
const listStore = useMapListStore();
const artifactCloudStore = useArtifactCloudStore();

const props = defineProps<{ mapPath: Shared.Paths.Path }>();

const hasQueue = computed(() => listStore.mapQueue.length > 0);

function handleOpenInHammer() {
    openMapInHammer(props.mapPath);
}

const dropdownItems = ref<DropdownMenuItem[][]>([
    [
        {
            label: "Browse to VMF",
            icon: AppDesign.Icons.ActionBrowseToFolder,
            onSelect() {
                window.electronAPI.fileBrowser.browseTo(props.mapPath);
            },
        },
        {
            label: "Browse to BSP",
            icon: AppDesign.Icons.ActionBrowseToFolder,
            disabled: Shared.Paths.getBspPathFromVmfPath(props.mapPath) === undefined,
            onSelect() {
                const bspFilePath = Shared.Paths.getBspPathFromVmfPath(props.mapPath);
                if (bspFilePath) {
                    window.electronAPI.fileBrowser.browseTo(bspFilePath);
                }
            },
        },
    ],
]);
</script>

<style scoped></style>
