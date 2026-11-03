import { ref } from "vue";
import { defineStore } from "pinia";
import { useMapListStore } from "~/store/MapListStore.js";
import * as Shared from "mod_companion_shared";

export const useMapTimeReportStore = defineStore("map-time-report", () => {
    const report = ref<Shared.Map.TimeReport | undefined>();
    const showReport = ref(false);
    const reportChart = ref<Map<string, number> | undefined>();

    function createTimeReport(): void {
        window.electronAPI.map.createTimeReport(toRaw(useMapListStore().mapList)).then((r) => {
            report.value = r;
            reportChart.value = _createReportChart(r);
        });
    }

    return { createTimeReport, showReport, report, reportChart };
});

function _createReportChart(report: Shared.Map.TimeReport): Map<string, number> {
    const map = new Map<string, number>();

    let longestTime = 0;
    let shortestTime = Number.MAX_VALUE;

    for (const secs of report.totals.values()) {
        if (secs > longestTime) {
            longestTime = secs;
        }

        if (secs < shortestTime) {
            shortestTime = secs;
        }
    }

    for (const [mapName, totalSeconds] of report.totals) {
        const ratio = totalSeconds / longestTime;

        map.set(mapName, Math.round(ratio * 100));
    }

    return map;
}
