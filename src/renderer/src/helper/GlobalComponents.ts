import MapsPanel from "~/components/panels/maps/MapsPanel.vue";
import FileBrowserPanel from "~/components/panels/fileBrowser/FileBrowserPanel.vue";
import FileInspectorPanel from "~/components/panels/fileInspector/FileInspectorPanel.vue";
import AssetBrowserPanel from "~/components/panels/assetBrowser/AssetBrowserPanel.vue";
import AssetInspectorPanel from "~/components/panels/assetInspector/AssetInspectorPanel.vue";
import AssetInspectorTexturePreviewPanel from "~/components/panels/assetInspector/texturePreviewPanel/AssetInspectorTexturePreviewPanel.vue";
import AssetInspectorTextureMetadataPanel from "~/components/panels/assetInspector/textureMetadataPanel/AssetInspectorTextureMetadataPanel.vue";
import AssetInspectorTextureConvertPanel from "~/components/panels/assetInspector/textureConvert/AssetInspectorTextureConvertPanel.vue";
import AssetInspectorGeneralPanel from "~/components/panels/assetInspector/generalPanel/AssetInspectorGeneralPanel.vue";
import PanelTab from "~/components/panelTabs/PanelTab.vue";
import MapCompileLogPanel from "~/components/panels/mapCompileLog/MapCompileLogPanel.vue";
import ConversionsPanel from "~/components/panels/conversions/ConversionsPanel.vue";
import GameConsolePanel from "~/components/panels/gameConsole/GameConsolePanel.vue";
import WaterMark from "~/components/panels/WaterMark.vue";
import AddPanelAction from "~/components/panels/AddPanelAction.vue";
import AssetInspectorTextureHotspotEditorPanel from "~/components/panels/assetInspector/textureHotspotEditor/AssetInspectorTextureHotspotEditorPanel.vue";
import { App as VueApp } from "vue";
import { AssetInspectorBehavior } from "~/components/panels/assetInspector/AssetInspector.model.js";
import { AssetBrowserBehavior } from "~/components/panels/assetBrowser/AssetBrowser.model.js";
import { FileBrowserBehavior } from "~/components/panels/fileBrowser/FileBrowser.model.js";
import { FileInspectorBehavior } from "~/components/panels/fileInspector/FileInspector.model.js";
import { MapsBehavior } from "~/components/panels/maps/Maps.model.js";
import { GameConsoleBehavior } from "~/components/panels/gameConsole/GameConsole.model.js";
import SubPanelTab from "~/components/panelTabs/SubPanelTab.vue";
import { ConversionsBehavior } from "~/components/panels/conversions/Conversions.model.js";
import { MapCompileLogBehavior } from "~/components/panels/mapCompileLog/MapCompileLog.model.js";
import { EventHandler } from "~/composables/useEvent.js";

export const GlobalComponentNames = {
    AssetInspectorTexturePreview: "_AssetInspector_TexturePreview",
    AssetInspectorTextureMetadata: "_AssetInspector_TextureMetadata",
    AssetInspectorTextureConvert: "_AssetInspector_TextureConvert",
    AssetInspectorTextureHotspotEditor: "_AssetInspector_TextureHotspotEditor",
    AssetInspectorGeneral: "_AssetInspector_General",
    MapList: "_MapList",
    MapCompileLog: "_MapCompileLog",
    FileBrowser: "_FileBrowser",
    FileInspector: "_FileInspector",
    AssetBrowser: "_AssetBrowser",
    AssetInspector: "_AssetInspector",
    Conversions: "_Conversions",
    GameConsole: "_StrataConsole", // legacy name to not break old layout save data
    PanelTab: "_PanelTab",
    SubPanelTab: "_SubPanelTab",
    AddPanelAction: "_AddPanelAction",
    Watermark: "_Watermark",
} as const;
export type GlobalComponentName = (typeof GlobalComponentNames)[keyof typeof GlobalComponentNames];

type Component = any;
export const GlobalComponentMapping: Record<GlobalComponentName, Component> = {
    _AssetInspector_TexturePreview: AssetInspectorTexturePreviewPanel,
    _AssetInspector_TextureMetadata: AssetInspectorTextureMetadataPanel,
    _AssetInspector_TextureConvert: AssetInspectorTextureConvertPanel,
    _AssetInspector_TextureHotspotEditor: AssetInspectorTextureHotspotEditorPanel,
    _AssetInspector_General: AssetInspectorGeneralPanel,
    _AssetBrowser: AssetBrowserPanel,
    _AssetInspector: AssetInspectorPanel,
    _FileBrowser: FileBrowserPanel,
    _FileInspector: FileInspectorPanel,
    _MapList: MapsPanel,
    _MapCompileLog: MapCompileLogPanel,
    _StrataConsole: GameConsolePanel,
    _Conversions: ConversionsPanel,
    _PanelTab: PanelTab,
    _SubPanelTab: SubPanelTab,
    _AddPanelAction: AddPanelAction,
    _Watermark: WaterMark,
};

/**
 * The panel model represents the entire globally accessible state of the panel.
 * All its behavior and representation is to be derived from nothing but the model
 * Properties marked with and underscore will not be saved.
 * These are still useful for globally accessible functions or event handlers that are created and managed at runtime
 */
export interface PanelModel {
    _onKeyInput?: EventHandler<KeyboardEvent>;
    _onClickInput?: EventHandler<MouseEvent>;
}

export const PanelComponentNames = [
    GlobalComponentNames.AssetInspector,
    GlobalComponentNames.AssetBrowser,
    GlobalComponentNames.FileBrowser,
    GlobalComponentNames.FileInspector,
    GlobalComponentNames.MapList,
    GlobalComponentNames.MapCompileLog,
    GlobalComponentNames.GameConsole,
    GlobalComponentNames.Conversions,
];
export type PanelComponentName = (typeof PanelComponentNames)[number];

export const SpawnablePanelComponentNames = [
    GlobalComponentNames.AssetBrowser,
    GlobalComponentNames.FileBrowser,
    GlobalComponentNames.MapList,
    GlobalComponentNames.MapCompileLog,
    GlobalComponentNames.GameConsole,
    GlobalComponentNames.Conversions,
];
export type SpawnablePanelComponentName = (typeof SpawnablePanelComponentNames)[number];

export interface PanelParams {
    panelName: PanelComponentName;
    panelId: string;
    noClose: boolean;
    temporary: boolean;
    unsaved: boolean;
}

export interface SubPanelParams {
    icon?: string;
    name: string;
}

export interface PanelBehavior<T extends PanelModel> {
    getTitle(model: T | undefined): string;
    getIcon(model: T | undefined): string;

    [key: string]: unknown;
}

export const PanelsBehaviors: Record<PanelComponentName, PanelBehavior<any>> = {
    [GlobalComponentNames.AssetInspector]: AssetInspectorBehavior,
    [GlobalComponentNames.AssetBrowser]: AssetBrowserBehavior,
    [GlobalComponentNames.FileBrowser]: FileBrowserBehavior,
    [GlobalComponentNames.FileInspector]: FileInspectorBehavior,
    [GlobalComponentNames.MapList]: MapsBehavior,
    [GlobalComponentNames.MapCompileLog]: MapCompileLogBehavior,
    [GlobalComponentNames.GameConsole]: GameConsoleBehavior,
    [GlobalComponentNames.Conversions]: ConversionsBehavior,
};

export function initGlobalComponents(app: VueApp<Element>): void {
    for (const [name, component] of Object.entries(GlobalComponentMapping)) {
        app.component(name, component);
    }
}
