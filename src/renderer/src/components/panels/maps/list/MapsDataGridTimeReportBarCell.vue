<template>
    <div class="bg-primary-600" :class="{ 'text-muted': chartWidth === '0%' }" :style="{ width: chartWidth }">
        <!-- Text intentionally overflows the boxes -->
        <span class="tabular-nums text-sm">
            {{ displayName }}
        </span>
    </div>
</template>

<script setup lang="ts">
import * as Shared from "mod_companion_shared";
import { useMapTimeReportStore } from "~/store/MapTimeReportStore.js";

const timeReportStore = useMapTimeReportStore();

const props = defineProps<{ mapPath: Shared.Paths.Path; displayName: string }>();

const chartWidth = computed(() => {
    const percentage = timeReportStore.reportChart?.get(props.mapPath);
    if (percentage === undefined) return "0%";

    return `${percentage}%`;
});
</script>

<style scoped></style>
