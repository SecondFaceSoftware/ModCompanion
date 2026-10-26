import "../main.css";
import "../dynapuff.css";

import "@fontsource/inter/100.css";
import "@fontsource/inter/100-italic.css";
import "@fontsource/inter/200.css";
import "@fontsource/inter/200-italic.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/300-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/400-italic.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/500-italic.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/600-italic.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/700-italic.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/800-italic.css";
import "@fontsource/inter/900.css";
import "@fontsource/inter/900-italic.css";

import "@fontsource-variable/jetbrains-mono";

import { initVue } from "~/renderer-vue.js";
import { initConfig } from "~/renderer-config.js";
import { useAssetGroupsStore } from "~/store/AssetGroupsStore.js";
import { initIcons } from "~/renderer-icons.js";
import { Logger } from "~/logger.js";
import { useArtifactCloudStore } from "~/store/ArtifactCloudStore.js";
import { useFileBrowserStore } from "~/store/FileBrowserStore.js";
import * as Shared from "mod_companion_shared";
import { registerGlobalShortcuts } from "~/renderer-global-shortcuts.js";

Logger.init();
initConfig();
initVue();
initIcons();

function postInit() {
    useAssetGroupsStore().refresh();
    useArtifactCloudStore().refresh();
    useFileBrowserStore().refreshDir("");

    registerGlobalShortcuts();
}

postInit();

Logger.info(Shared.Log.Channel.Generic, "Renderer is ready");
window.electronAPI.app.rendererReady();
