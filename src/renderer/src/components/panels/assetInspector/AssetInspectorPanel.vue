<template>
    <TooltipProvider>
        <template v-if="model && editAsset">
            <div class="grid grid-rows-[auto_minmax(0,1fr)] h-full">
                <header class="flex m-1">
                    <AssetInspectorConversion :asset-id="model.assetId" />
                    <div class="ml-auto">
                        <AssetInspectorSaved />
                    </div>
                </header>
                <AssetInspectorRoot :asset="editAsset" />
            </div>
        </template>
    </TooltipProvider>
</template>

<script setup lang="ts">
import { TooltipProvider } from "reka-ui";
import AssetInspectorSaved from "~/components/panels/assetInspector/AssetInspectorSaved.vue";
import { IDockviewPanelProps } from "dockview-vue";
import { PanelParams } from "~/helper/GlobalComponents.js";
import { usePanelsStore } from "~/store/PanelsStore.js";
import { AssetInspectorModel } from "~/components/panels/assetInspector/AssetInspector.model.js";
import { useAssetListStore } from "~/store/AssetListStore.js";
import * as Shared from "mod_companion_shared";

const props = defineProps<{ params: IDockviewPanelProps<PanelParams> }>();
const model = computed(() => usePanelsStore().getModel<AssetInspectorModel>(props.params.params.panelId));

const assetListStore = useAssetListStore();
const editAsset = ref<Shared.Asset.Asset | undefined>(undefined);
watch(
    () => model.value?.assetId,
    (newAssetId) => {
        const newAsset = assetListStore.getAssetById(newAssetId);
        if (newAsset) {
            editAsset.value = newAsset;
        }
    },
);
</script>

<style scoped></style>
