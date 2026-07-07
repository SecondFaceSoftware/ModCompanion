import { Reactive } from "vue";
import * as pathe from "pathe";
import * as Shared from "mod_companion_shared";
import { useAssetListStore } from "~/store/AssetListStore.js";
import { AppDesign } from "~/design/AppDesign.js";
import { PanelBehavior, PanelModel } from "~/helper/GlobalComponents.js";

export interface AssetInspectorModel extends PanelModel {
    assetId: Shared.Asset.AssetId;
}

export const AssetInspectorBehavior = {
    AssetInjectKey: Symbol() as InjectionKey<{
        assetId: ComputedRef<Shared.Asset.AssetId>;
    }>,
    TextureInjectKey: Symbol() as InjectionKey<{
        meta: MaybeRefOrGetter<Shared.ImageMeta.SharedImageMetaReport | undefined>;
        assetId: ComputedRef<Shared.Asset.AssetId>;
    }>,
    PanelsInjectKey: Symbol() as InjectionKey<{
        visiblePanels: Reactive<Map<string, boolean>>;
    }>,
    getTitle(model: AssetInspectorModel | undefined): string {
        if (!model) {
            return "Asset Inspector";
        }

        const displayName = useAssetListStore().getAssetById(model.assetId)?.def.displayName;
        const assetName = displayName ? pathe.basename(displayName) : "(unknown)";
        return "Asset " + assetName;
    },
    getIcon(model: AssetInspectorModel | undefined): string {
        return AppDesign.Icons.Panel_AssetInspector;
    },
} satisfies PanelBehavior<AssetInspectorModel>;
