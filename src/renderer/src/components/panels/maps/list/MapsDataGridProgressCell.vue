<template>
    <div class="flex justify-center">
        <UIcon v-if="state === Shared.Map.CompileState.Idle" :name="AppDesign.Icons.MapCompileIdle" />
        <UIcon
            v-if="state === Shared.Map.CompileState.InProgress"
            :name="AppDesign.Icons.MapCompileInProgress"
            class="text-info animate-spin"
        />
        <UIcon
            v-if="state === Shared.Map.CompileState.Completed"
            :name="AppDesign.Icons.MapCompileCompleted"
            class="text-success"
        />
    </div>
</template>

<script setup lang="ts">
import { useMapCompileStore } from "~/store/MapCompileStore.js";
import { computed } from "vue";
import { AppDesign } from "~/design/AppDesign.js";
import * as Shared from "mod_companion_shared";

const props = defineProps<{ mapName: string; step: Shared.Map.CompileStep }>();

const compileStore = useMapCompileStore();

const state = computed<Shared.Map.CompileState>(() => {
    const p = compileStore.progress.get(Shared.Map.createMapPathAndStep(props.mapName, props.step));
    if (!p) return Shared.Map.CompileState.Idle;

    return p;
});
</script>

<style scoped></style>
