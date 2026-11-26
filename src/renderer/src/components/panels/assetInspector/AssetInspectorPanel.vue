<template>
    <TooltipProvider>
        <template v-if="model && asset">
            <div class="grid grid-rows-[auto_minmax(0,1fr)] h-full">
                <header class="flex m-1 mb-0">
                    <AssetInspectorConversion :asset-id="model.assetId" />
                    <div class="ml-auto">
                        <AssetInspectorSaved />
                    </div>
                    <AssetInspectorQuickActions :asset="asset" />
                </header>
                <AssetInspectorRoot :asset="asset" />
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
import AssetInspectorQuickActions from "~/components/panels/assetInspector/AssetInspectorQuickActions.vue";

const props = defineProps<{ params: IDockviewPanelProps<PanelParams> }>();
const model = computed(() => usePanelsStore().getModel<AssetInspectorModel>(props.params.params.panelId));

const assetListStore = useAssetListStore();
const asset = computed(() => assetListStore.getAssetById(model.value?.assetId));
</script>

<style scoped></style>
