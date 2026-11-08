import { createApp } from "vue";
import { createPinia } from "pinia";
import ui from "@nuxt/ui/vue-plugin";
import App from "~/components/App.vue";
import { useMapConsoleStore } from "~/store/MapConsoleStore.js";
import { useAssetConversionStore } from "~/store/AssetConversionStore.js";
import { createMemoryHistory, createRouter } from "vue-router";
import { useGameInteropStore } from "~/store/GameInteropStore.js";
import { useArtifactCloudStore } from "~/store/ArtifactCloudStore.js";
import { useMessageLogStore } from "~/store/MessageLogStore.js";
import { initGlobalComponents } from "~/helper/GlobalComponents.js";
import { useSystemStore } from "~/store/SystemStore.js";
import { useTaskStore } from "~/store/TaskStore.js";

export function initVue() {
    const pinia = createPinia();
    const app = createApp(App);

    app.use(pinia);
    app.use(ui);

    // Create empty router because nuxt ui has a stupid dependency on it
    app.use(createRouter({ history: createMemoryHistory(), routes: [] }));

    initGlobalComponents(app);
    _initSystemStores();

    app.mount("#app");
}

// These stores need to be initialized on app startup
function _initSystemStores() {
    useMessageLogStore();
    useMapConsoleStore();
    useAssetConversionStore();
    useGameInteropStore();
    useArtifactCloudStore();
    useSystemStore();
    useTaskStore();
}
