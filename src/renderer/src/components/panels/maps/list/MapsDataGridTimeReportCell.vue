<template>
    <span v-if="seconds !== undefined" class="text-center text-xs text-neutral-400">{{ seconds }}s</span>
    <span v-else />
</template>

<script setup lang="ts">
import { useMapTimeReportStore } from "~/store/MapTimeReportStore.js";
import { computed } from "vue";
import * as Shared from "mod_companion_shared";

const props = defineProps<{ mapName: string; step: Shared.Map.CompileStep }>();

const timeReportStore = useMapTimeReportStore();

const seconds = computed(() => {
    return timeReportStore.report?.maps.get(Shared.Map.createMapPathAndStep(props.mapName, props.step));
});
</script>

<style scoped></style>
