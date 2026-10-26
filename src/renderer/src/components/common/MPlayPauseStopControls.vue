<template>
    <UFieldGroup class="h-full inline-flex gap-1">
        <UButton
            :icon="AppDesign.Icons.ActionPlay"
            :color="compileStore.state !== Shared.PlayPauseStop.State.Playing ? 'success' : 'neutral'"
            :disabled="compileStore.state === Shared.PlayPauseStop.State.Playing"
            @click="handleClickPlay"
        />
        <UButton
            :icon="AppDesign.Icons.ActionPause"
            :color="compileStore.state === Shared.PlayPauseStop.State.Playing ? 'warning' : 'neutral'"
            :disabled="compileStore.state !== Shared.PlayPauseStop.State.Playing"
            @click="handleClickPause"
        />
        <UButton
            :icon="AppDesign.Icons.ActionStop"
            :color="compileStore.state !== Shared.PlayPauseStop.State.Stopped ? 'error' : 'neutral'"
            :disabled="compileStore.state === Shared.PlayPauseStop.State.Stopped"
            @click="handleClickStop"
        />
    </UFieldGroup>
</template>

<script setup lang="ts">
import { useMapCompileStore } from "~/store/MapCompileStore.js";
import { AppDesign } from "~/design/AppDesign.js";
import * as Shared from "mod_companion_shared";

const compileStore = useMapCompileStore();

function handleClickPlay() {
    compileStore.state = Shared.PlayPauseStop.State.Playing;
}

function handleClickPause() {
    compileStore.state = Shared.PlayPauseStop.State.Paused;
}

function handleClickStop() {
    compileStore.state = Shared.PlayPauseStop.State.Stopped;
}
</script>

<style scoped></style>
