<template>
    <span v-if="totalSeconds !== undefined" class="text-center text-xs">{{ totalSeconds }}s</span>
    <span v-else />
</template>

<script setup lang="ts">
import * as Shared from "mod_companion_shared";
import { useMapTimeReportStore } from "~/store/MapTimeReportStore.js";
import { computed } from "vue";

const props = defineProps<{ mapPath: Shared.Paths.Path }>();

const timeReportStore = useMapTimeReportStore();

const totalSeconds = computed(() => timeReportStore.report?.totals.get(props.mapPath));
</script>

<style scoped></style>
