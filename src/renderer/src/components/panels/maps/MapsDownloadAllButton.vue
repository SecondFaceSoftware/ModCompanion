<template>
    <UButton label="Download All" :disabled="downloading" @click="handlePressed">
        <template #leading>
            <template v-if="downloading">
                <UIcon :name="AppDesign.Icons.Loading" class="size-5 animate-spin" />
            </template>
            <template v-else>
                <UIcon :name="AppDesign.Icons.ActionDownload" class="size-5" />
            </template>
        </template>
    </UButton>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import { useArtifactCloudStore } from "~/store/ArtifactCloudStore.js";

const artifactCloudStore = useArtifactCloudStore();

const downloading = computed(() => artifactCloudStore.activeDownloads.size > 0);

function handlePressed() {
    artifactCloudStore.downloadAll();
}
</script>

<style scoped></style>
