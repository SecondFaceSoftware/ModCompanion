<template>
    <USelect
        v-model="assetType"
        :items="selectItems"
        value-key="id"
        :icon="icon"
        class="w-full"
        @change="updateType"
        :disabled="asset.isTransient"
    />
</template>

<script setup lang="ts">
import { SelectItem } from "@nuxt/ui/components/Select.vue.js";
import { getAssetTypeIcon, getAssetTypeName } from "~/design/AppDesign.js";
import { AssetInspectorGeneralInjectKey } from "~/components/panels/assetInspector/generalPanel/AssetInspectorGeneral.model.js";
import * as Shared from "mod_companion_shared";

const props = defineProps<{ asset: Shared.Asset.Asset }>();

const assetType = ref<Shared.Asset.Type>(props.asset.def.type);
watch(
    () => props.asset.def.type,
    (n) => {
        assetType.value = n;
    },
);

const selectItems = Object.values(Shared.Asset.Types).map<SelectItem>((t) => ({
    id: t,
    label: getAssetTypeName(t),
    icon: getAssetTypeIcon(t),
}));
const icon = computed(() => selectItems.find((item) => item.value === assetType.value)?.icon);

const inj = inject(AssetInspectorGeneralInjectKey);

async function updateType() {
    if (assetType.value === props.asset.def.type) return;

    inj?.updateAsset({ type: assetType.value });
}
</script>

<style scoped></style>
