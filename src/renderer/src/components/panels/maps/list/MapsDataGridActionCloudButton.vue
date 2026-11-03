<template>
    <UTooltip :text="tooltip">
        <UPopover v-model:open="open">
            <UButton :disabled="isButtonDisabled" @click="handleDownloadQuickClicked">
                <template #leading>
                    <template v-if="downloadPromise !== undefined">
                        <UIcon :name="AppDesign.Icons.Loading" class="size-5 animate-spin" />
                    </template>
                    <template v-else>
                        <UIcon :name="AppDesign.Icons.ActionDownload" class="size-5" />
                    </template>
                </template>
            </UButton>
            <template #content>
                <div class="text-xs">
                    <div class="p-2 grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                        <template v-for="map in maps" :key="map.dateModified.getTime()">
                            <div>
                                <UButton
                                    size="sm"
                                    variant="ghost"
                                    class="w-full"
                                    :icon="AppDesign.Icons.ActionDownload"
                                    @click="() => handleDownloadMapClicked(map)"
                                >
                                    <div class="grow flex gap-4 justify-between select-none tabular-nums">
                                        <span>
                                            {{ map.dateModified.toDateString() }}
                                        </span>
                                        <span>
                                            {{ fileSize(map.size) }}
                                        </span>
                                    </div>
                                </UButton>
                            </div>
                        </template>
                    </div>
                    <div class="text-center text-muted p-2">Tip: Hold shift to download quickly</div>
                </div>
            </template>
        </UPopover>
    </UTooltip>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import { useArtifactCloudStore } from "~/store/ArtifactCloudStore.js";
import { fileSize } from "humanize-plus";
import { MapInfo } from "mod_companion_shared/SharedArtifactCloud.js";

const props = defineProps<{ mapName: string; disabled?: boolean }>();
const open = ref(false);

const artifactCloudStore = useArtifactCloudStore();

const downloadPromise = computed(() => artifactCloudStore.activeDownloads.get(props.mapName));

const isButtonDisabled = computed(
    () => props.disabled || downloadPromise.value !== undefined || maps.value.length === 0,
);

const maps = computed(() => artifactCloudStore.mapsList.get(props.mapName) ?? []);
const tooltip = computed(() =>
    maps.value.length > 0
        ? `Download latest (${maps.value[0].dateModified.toDateString()}) ${fileSize(maps.value[0].size)}`
        : "No artifacts available",
);

function handleDownloadQuickClicked(event: MouseEvent) {
    if (event.shiftKey) {
        artifactCloudStore.downloadMap(props.mapName, maps.value[0].objectKey);
        open.value = !open.value; // Prevent it from changing state because fuck this library
    }
}

function handleDownloadMapClicked(map: MapInfo) {
    artifactCloudStore.downloadMap(props.mapName, map.objectKey);
    open.value = false;
}
</script>

<style scoped></style>
