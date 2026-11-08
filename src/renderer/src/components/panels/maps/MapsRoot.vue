<template>
    <MPanelRoot no-scroll>
        <template #header>
            <div class="flex gap-1 flex-wrap">
                <MapAddButton />
                <UInput
                    v-model="listStore.searchTerm"
                    placeholder="Search"
                    block
                    :leading-icon="AppDesign.Icons.Search"
                />

                <div class="mx-auto">
                    <MPlayPauseStopControls />
                </div>
                <MapsDownloadAllButton />
                <MapsTimeReportToggle />
            </div>
        </template>
        <MapsDataGrid />
    </MPanelRoot>
</template>

<script setup lang="ts">
import MapsDataGrid from "./list/MapsDataGrid.vue";
import { useMapListStore } from "~/store/MapListStore.js";
import MapsTimeReportToggle from "./MapsTimeReportToggle.vue";
import { AppDesign } from "~/design/AppDesign.js";
import MapAddButton from "~/components/panels/maps/MapAddButton.vue";
import MapsDownloadAllButton from "~/components/panels/maps/MapsDownloadAllButton.vue";

const listStore = useMapListStore();
</script>

<style scoped></style>
