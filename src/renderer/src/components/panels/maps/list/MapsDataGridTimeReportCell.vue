<template>
    <span v-if="seconds !== undefined" class="text-center text-xs text-neutral-400">{{ seconds }}s</span>
    <span v-else />
</template>

<script setup lang="ts">
import { useMapTimeReportStore } from "~/store/MapTimeReportStore.js";
import { computed } from "vue";
import * as Shared from "mod_companion_shared";

const props = defineProps<{ mapPath: Shared.Paths.Path; step: Shared.Map.CompileStep }>();

const timeReportStore = useMapTimeReportStore();

const seconds = computed(() => {
    return timeReportStore.report?.maps.get({ step: props.step, map: props.mapPath });
});
</script>

<style scoped></style>
