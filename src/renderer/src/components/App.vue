<template>
    <UApp>
        <div class="grid main-layout h-screen bg-neutral-250 dark:bg-neutral-925">
            <div>
                <TheSidebar />
            </div>
            <div class="h-full grid grid-cols-1 grid-rows-1 p-1 relative">
                <DockviewVue
                    :theme="themeModcomp"
                    :watermark-component="PanelComponents.other.watermark.componentId"
                    :left-header-actions-component="PanelComponents.other.addPanelAction.componentId"
                    :default-tab-component="PanelComponents.tabComponents.panelTab.componentId"
                    default-renderer="onlyWhenVisible"
                    @ready="panelsStore.handleReady"
                />

                <!-- Register takeovers here -->
                <MessageLogTakeOver />
                <AssetWizardTakeOver />
                <ChamberSignConfigTakeOver />
            </div>
            <TheFooter />
        </div>
    </UApp>
</template>

<script setup lang="ts">
import TheSidebar from "./sidebar/TheSidebar.vue";
import { DockviewVue } from "dockview-vue";
import { usePanelsStore } from "~/store/PanelsStore.js";
import { PanelComponents } from "~/helper/PanelComponents.js";
import { themeModcomp } from "~/design/ModcompDockviewTheme.js";

const panelsStore = usePanelsStore();
</script>

<style scoped>
.main-layout {
    grid-template-columns: 10rem minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) 2.2rem;
}
</style>
