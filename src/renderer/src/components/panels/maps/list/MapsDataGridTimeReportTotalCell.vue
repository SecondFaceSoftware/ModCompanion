<template>
    <span v-if="totalSeconds !== undefined" class="text-center text-xs">{{ totalSeconds }}s</span>
    <span v-else />
</template>

<script setup lang="ts">
import { useMapTimeReportStore } from "~/store/MapTimeReportStore.js";
import { computed } from "vue";

const props = defineProps<{ mapName: string }>();

const timeReportStore = useMapTimeReportStore();

const totalSeconds = computed(() => timeReportStore.report?.totals.get(props.mapName));
</script>

<style scoped></style>
