<template>
    <UButton
        :disabled="!path"
        :icon="AppDesign.Icons.ActionBrowseToFolder"
        size="sm"
        variant="link"
        @click="handleBrowse"
    />
    <UButton
        :disabled="!path"
        :icon="AppDesign.Icons.ActionLaunchFile"
        size="sm"
        variant="link"
        class="mr-1"
        @click="handleLaunch"
    />
</template>

<script setup lang="ts">
import * as Shared from "mod_companion_shared";
import { AppDesign } from "~/design/AppDesign.js";

const props = defineProps<{ path?: Shared.Paths.Path }>();

function handleBrowse(): void {
    if (props.path) {
        window.electronAPI.fileBrowser.browseTo(props.path);
    }
}

function handleLaunch(): void {
    if (props.path) {
        window.electronAPI.fileBrowser.open(props.path);
    }
}
</script>

<style scoped></style>
