<template>
    <div class="grid grid-cols-[minmax(0,1fr)] grid-rows-1 h-full p-1">
        <DockviewVue
            :theme="themeModcompNested"
            :default-tab-component="GlobalComponentNames.SubPanelTab"
            default-renderer="onlyWhenVisible"
            @ready="handleReady"
        />
    </div>
</template>

<script setup lang="ts">
import { DockviewApi, DockviewReadyEvent, DockviewVue, SerializedDockview } from "dockview-vue";
import { AssetInspectorBehavior } from "~/components/panels/assetInspector/AssetInspector.model.js";
import * as pathe from "pathe";
import { getAppConfig } from "~/renderer-config.js";
import { useWorkspaceStore } from "~/store/WorkspaceStore.js";
import { fetchImageMeta } from "~/store/ImageCacheStore.js";
import { themeModcompNested } from "~/design/ModcompDockviewTheme.js";
import * as Shared from "mod_companion_shared";
import { GlobalComponentNames, SubPanelParams } from "~/helper/GlobalComponents.js";
import { AppDesign } from "~/design/AppDesign.js";
import { Logger } from "~/logger.js";

const props = defineProps<{ asset: Shared.Asset.Asset }>();
const workspaceStore = useWorkspaceStore();

const api = ref<DockviewApi>();
const lastType = ref<Shared.Asset.Type | undefined>();

const textureMeta = ref<Shared.ImageMeta.ImageMetaReport | undefined>(undefined);
const visiblePanels = reactive<Map<string, boolean>>(new Map());

function handleReady(e: DockviewReadyEvent): void {
    api.value = e.api;
    updateTabs(props.asset.def.type, e.api);

    handleAssetUpdated(props.asset, api.value);

    e.api.onDidLayoutChange(() => {
        serializeLayout(e.api);

        for (const panel of e.api.panels) {
            visiblePanels.set(panel.id, panel.api.isVisible);
        }
    });
}

watch(
    () => props.asset,
    (a) => {
        if (api.value !== undefined) {
            handleAssetUpdated(a, api.value);
        }
    },
);

provide(AssetInspectorBehavior.AssetInjectKey, {
    assetId: computed(() => props.asset.def.id),
});

provide(AssetInspectorBehavior.TextureInjectKey, {
    meta: textureMeta,
    assetId: computed(() => props.asset.def.id),
});

provide(AssetInspectorBehavior.PanelsInjectKey, {
    visiblePanels,
});

function handleAssetUpdated(asset: Shared.Asset.Asset, api: DockviewApi): void {
    if (Shared.Asset.isTextureAsset(asset)) {
        updateTextureMeta(asset);
    }

    updateTabs(asset.def.type, api);
}

function updateTextureMeta(asset: Shared.Asset.TextureAsset) {
    const content = asset.def.contentFiles;
    if (content === undefined || content.length === 0) {
        return;
    }
    const sourceFile = content[0];

    const fullPath = pathe.join(getAppConfig().contentPath, sourceFile);
    fetchImageMeta(fullPath).then((meta) => {
        textureMeta.value = meta;
    });
}

function serializeLayout(a: DockviewApi) {
    const json = a.toJSON();
    const currentType = props.asset.def.type;
    const workspace = workspaceStore.activeWorkspace ?? "unknown";
    const key = `asset-inspector-layout-${workspace}-${currentType}`;

    localStorage.setItem(key, JSON.stringify(json));
}

function deserializeLayout(type: Shared.Asset.Type): SerializedDockview | undefined {
    const workspace = workspaceStore.activeWorkspace ?? "unknown";
    const key = `asset-inspector-layout-${workspace}-${type}`;
    const itemRaw = localStorage.getItem(key);
    if (itemRaw === null) {
        return undefined;
    }

    const item = JSON.parse(itemRaw);
    return item;
}

const SubPanels = [
    GlobalComponentNames.AssetInspectorGeneral,
    GlobalComponentNames.AssetInspectorTextureConvert,
    GlobalComponentNames.AssetInspectorTextureHotspotEditor,
    GlobalComponentNames.AssetInspectorTextureMetadata,
    GlobalComponentNames.AssetInspectorTexturePreview,
];
export type SubPanel = (typeof SubPanels)[number];

const SubPanelsTitles: Record<SubPanel, string> = {
    [GlobalComponentNames.AssetInspectorGeneral]: "General",
    [GlobalComponentNames.AssetInspectorTextureConvert]: "VTF Settings",
    [GlobalComponentNames.AssetInspectorTextureHotspotEditor]: "Hotspot",
    [GlobalComponentNames.AssetInspectorTextureMetadata]: "Meta",
    [GlobalComponentNames.AssetInspectorTexturePreview]: "Preview",
};

const SubPanelsIcons: Record<SubPanel, string> = {
    [GlobalComponentNames.AssetInspectorGeneral]: AppDesign.Icons.Panel_AssetInspector_General,
    [GlobalComponentNames.AssetInspectorTextureConvert]: AppDesign.Icons.Panel_AssetInspector_TextureConvert,
    [GlobalComponentNames.AssetInspectorTextureHotspotEditor]:
        AppDesign.Icons.Panel_AssetInspector_TextureHotspotEditor,
    [GlobalComponentNames.AssetInspectorTextureMetadata]: AppDesign.Icons.Panel_AssetInspector_TextureMetadata,
    [GlobalComponentNames.AssetInspectorTexturePreview]: AppDesign.Icons.Panel_AssetInspector_TexturePreview,
};

function getPanelsByType(type: Shared.Asset.Type): SubPanel[] {
    const defaultPanels = [GlobalComponentNames.AssetInspectorGeneral];
    const whichPanelsShouldExist: SubPanel[] = defaultPanels;

    if (type === Shared.Asset.Types.Texture) {
        whichPanelsShouldExist.push(GlobalComponentNames.AssetInspectorTexturePreview);
        whichPanelsShouldExist.push(GlobalComponentNames.AssetInspectorTextureMetadata);
        whichPanelsShouldExist.push(GlobalComponentNames.AssetInspectorTextureConvert);
        whichPanelsShouldExist.push(GlobalComponentNames.AssetInspectorTextureHotspotEditor);
    }

    return whichPanelsShouldExist;
}

function setupTabs(type: Shared.Asset.Type, api: DockviewApi) {
    const whichPanelsShouldExist = getPanelsByType(type);

    const panels = api.panels;
    // Spawn missing panels
    for (const panel of whichPanelsShouldExist) {
        const alreadyExists = panels.some((p) => p.id === panel);
        if (!alreadyExists) {
            api.addPanel<SubPanelParams>({
                id: panel,
                component: panel,
                tabComponent: GlobalComponentNames.SubPanelTab,
                params: { name: SubPanelsTitles[panel], icon: SubPanelsIcons[panel] },
            });
        }
    }

    // Destroy unneeded panels
    for (const panel of panels) {
        const shouldExist = whichPanelsShouldExist.some((p) => panel.id === p);
        if (!shouldExist) {
            api.removePanel(panel);
        }
    }
}

function updateTabs(type: Shared.Asset.Type, api: DockviewApi): void {
    if (type === lastType.value) return;
    lastType.value = type;

    const savedPanels = deserializeLayout(type);
    if (savedPanels) {
        try {
            api.fromJSON(savedPanels);
        } catch (e) {
            Logger.warning(Shared.Log.Channel.Assets, e);
        }
    }

    setupTabs(type, api);
    serializeLayout(api);
}
</script>

<style scoped></style>
