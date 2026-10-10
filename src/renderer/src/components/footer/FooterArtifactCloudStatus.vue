<template>
    <div class="text-xs select-none font-semibold text-magenta-900">
        <div v-if="artifactCloudStore.connected">
            <UTooltip text="Cloud Connected">
                <UIcon class="size-4" :name="AppDesign.Icons.NetworkConnected" />
            </UTooltip>
        </div>
        <div v-else>
            <UTooltip text="Cloud not reachable">
                <UIcon class="size-4" :name="AppDesign.Icons.NetworkDisconnected" />
            </UTooltip>
        </div>
    </div>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import { useArtifactCloudStore } from "~/store/ArtifactCloudStore.js";

const artifactCloudStore = useArtifactCloudStore();
</script>

<style scoped></style>
