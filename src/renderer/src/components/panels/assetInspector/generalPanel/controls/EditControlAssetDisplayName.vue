<template>
    <UInput
        v-model="displayName"
        placeholder="(unknown)"
        class="w-full"
        :disabled="asset.isTransient || disabled"
        @change="updateDisplayName"
    />
</template>

<script setup lang="ts">
import { AssetInspectorGeneralInjectKey } from "~/components/panels/assetInspector/generalPanel/AssetInspectorGeneral.model.js";
import * as Shared from "mod_companion_shared";

const props = defineProps<{ asset: Shared.Asset.Asset }>();

const displayName = ref<string | undefined>(props.asset.def.displayName);
watch(
    () => props.asset.def.displayName,
    (n) => {
        displayName.value = n;
    },
);

const inj = inject(AssetInspectorGeneralInjectKey);

const disabled = computed(() => (inj === undefined ? false : inj.waiting.value));
function updateDisplayName() {
    if (displayName.value === props.asset.def.displayName) return;

    inj?.updateAsset({ displayName: displayName.value });
}
</script>

<style scoped></style>
