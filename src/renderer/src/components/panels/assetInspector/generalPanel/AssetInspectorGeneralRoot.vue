<template>
    <MPanelRoot>
        <div class="grid grid-cols-2 gap-2 content-start">
            <EditControlAssetDef :asset="asset" />
            <UFormField label="Type">
                <EditControlAssetType :asset="asset" />
            </UFormField>
            <UFormField label="ID">
                <UInput :model-value="asset.def.id" disabled class="w-full" />
            </UFormField>
            <UFormField label="Display Name" class="col-span-2">
                <EditControlAssetDisplayName :asset="asset" />
            </UFormField>

            <template v-if="Shared.Asset.hasContentFiles(asset.def.type)">
                <EditControlAssetFileList
                    heading="Content Files"
                    :asset="asset"
                    field="contentFiles"
                    :base="Shared.FileBrowser.PathBases.ContentRelative"
                />
            </template>

            <template v-if="Shared.Asset.hasGameFiles(asset.def.type)">
                <EditControlAssetFileList
                    heading="Game Files"
                    :asset="asset"
                    field="gameFiles"
                    :max-items="maxGameFiles"
                    :base="Shared.FileBrowser.PathBases.GameRelative"
                />
            </template>
            <template v-if="!asset.isTransient">
                <UFormField label="Associated Files" class="col-span-2">
                    <EditControlAssetAssociated :asset="asset" />
                </UFormField>

                <UFormField label="Credits" class="col-span-2">
                    <EditControlAssetCredits :asset="asset" />
                </UFormField>

                <div>
                    <UButton label="Delete Asset" :icon="AppDesign.Icons.ActionRemove" @click="handleDelete" />
                </div>
            </template>
        </div>
    </MPanelRoot>
</template>

<script setup lang="ts">
import { AssetInspectorGeneralInjectKey } from "~/components/panels/assetInspector/generalPanel/AssetInspectorGeneral.model.js";
import EditControlAssetDisplayName from "~/components/panels/assetInspector/generalPanel/controls/EditControlAssetDisplayName.vue";
import EditControlAssetType from "~/components/panels/assetInspector/generalPanel/controls/EditControlAssetType.vue";
import { useAssetListStore } from "~/store/AssetListStore.js";
import EditControlAssetDef from "~/components/panels/assetInspector/generalPanel/controls/EditControlAssetDef.vue";
import EditControlAssetAssociated from "~/components/panels/assetInspector/generalPanel/controls/EditControlAssetAssociated.vue";
import { AppDesign } from "~/design/AppDesign.js";
import * as Shared from "mod_companion_shared";

const props = defineProps<{ asset: Shared.Asset.Asset }>();
const waiting = ref(false);
provide(AssetInspectorGeneralInjectKey, { waiting, updateAsset });

const assetStore = useAssetListStore();

async function updateAsset(def: Partial<Shared.Asset.AssetDef>) {
    waiting.value = true;

    try {
        const rawAsset = toRaw(props.asset);
        const assetDef: Shared.Asset.AssetDef = { ...rawAsset.def, ...def };
        const newAsset: Shared.Asset.Asset = { ...rawAsset, def: assetDef };
        assetStore.writeAssets([newAsset]);

        // Toast on failure?
    } finally {
        waiting.value = false;
    }
}

const maxGameFiles = computed(() => {
    if (props.asset.def.type === Shared.Asset.Types.Texture) {
        return 1;
    } else return undefined;
});

function handleDelete() {
    assetStore.deleteAsset(props.asset.def.id);
}
</script>

<style scoped></style>
