<template>
    <MDataTable
        ref="table"
        :row-height="32"
        :entries="listStore.filteredMapList"
        :columns="columns"
        neutral-highlight
        no-scroll
        @on-active-changed="handleActiveChanged"
    />
</template>

<script setup lang="ts">
import { useMapListStore } from "~/store/MapListStore.js";
import { useMapTimeReportStore } from "~/store/MapTimeReportStore.js";
import { DataTableColumn } from "~/components/common/dataTable/MDataTable.model.js";
import { computed } from "vue";
import MapsDataGridProgressCell from "~/components/panels/maps/list/MapsDataGridProgressCell.vue";
import MapsDataGridActionsCell from "~/components/panels/maps/list/MapsDataGridActionsCell.vue";
import MapsDataGridTimeReportTotalCell from "~/components/panels/maps/list/MapsDataGridTimeReportTotalCell.vue";
import MapsDataGridTimeReportCell from "~/components/panels/maps/list/MapsDataGridTimeReportCell.vue";
import MapsDataGridTimeReportBarCell from "~/components/panels/maps/list/MapsDataGridTimeReportBarCell.vue";
import * as Shared from "mod_companion_shared";

const listStore = useMapListStore();
const timeReportStore = useMapTimeReportStore();
const table = useTemplateRef("table");

const columns = computed(() => (timeReportStore.showReport ? reportColumns : listColumns));

const listColumns: DataTableColumn<string>[] = [
    {
        id: "name",
        label: "Name",
        size: "1fr",
        cell: (entry) => h("span", { class: "tabular-nums text-sm" }, entry),
    },
    {
        id: "vbsp",
        label: "VBSP",
        cell: (entry) => h(MapsDataGridProgressCell, { mapName: entry, step: Shared.Map.CompileStep.VBsp }),
        headerClass: "text-center px-1",
    },
    {
        id: "post",
        label: "POST",
        cell: (entry) => h(MapsDataGridProgressCell, { mapName: entry, step: Shared.Map.CompileStep.Post }),
        headerClass: "text-center px-1",
    },
    {
        id: "vvis",
        label: "VVIS",
        cell: (entry) => h(MapsDataGridProgressCell, { mapName: entry, step: Shared.Map.CompileStep.VVis }),
        headerClass: "text-center px-1",
    },
    {
        id: "vrad",
        label: "VRAD",
        cell: (entry) => h(MapsDataGridProgressCell, { mapName: entry, step: Shared.Map.CompileStep.VRad }),
        headerClass: "text-center px-1",
    },
    {
        id: "game",
        label: "GAME",
        cell: (entry) => h(MapsDataGridProgressCell, { mapName: entry, step: Shared.Map.CompileStep.Game }),
        headerClass: "text-center px-1",
    },
    {
        id: "done",
        label: "DONE",
        cell: (entry) => h(MapsDataGridProgressCell, { mapName: entry, step: Shared.Map.CompileStep.Done }),
        headerClass: "text-center px-1",
    },
    {
        id: "actions",
        label: "",
        cell: (entry) => h(MapsDataGridActionsCell, { mapName: entry }),
        headerClass: "text-center px-1",
    },
];

const reportColumns: DataTableColumn<string>[] = [
    {
        id: "name",
        label: "Name",
        size: "1fr",
        cell: (entry) =>
            h(MapsDataGridTimeReportBarCell, {
                mapName: entry,
                displayName: entry,
            }),
    },
    {
        id: "vbsp",
        label: "VBSP",
        cell: (entry) => h(MapsDataGridTimeReportCell, { mapName: entry, step: Shared.Map.CompileStep.VBsp }),
        headerClass: "text-center px-2",
    },
    {
        id: "vvis",
        label: "VVIS",
        cell: (entry) => h(MapsDataGridTimeReportCell, { mapName: entry, step: Shared.Map.CompileStep.VVis }),
        headerClass: "text-center px-2",
    },
    {
        id: "vrad",
        label: "VRAD",
        cell: (entry) => h(MapsDataGridTimeReportCell, { mapName: entry, step: Shared.Map.CompileStep.VRad }),
        headerClass: "text-center px-2",
    },
    {
        id: "total",
        label: "TOTAL",
        cell: (entry) => h(MapsDataGridTimeReportTotalCell, { mapName: entry }),
        headerClass: "text-center px-2",
    },
    {
        id: "actions",
        label: "",
        cell: (entry) => h(MapsDataGridActionsCell, { mapName: entry }),
        headerClass: "text-center px-2",
    },
];

function handleActiveChanged(mapName: string | undefined): void {
    listStore.selectMap(mapName);
}

watch(
    () => listStore.selectedMap,
    (value, oldValue) => {
        table.value?.activate((entry) => entry === value);
    },
);
</script>

<style scoped></style>
