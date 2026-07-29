<template>
    <div class="flex gap-1">
        <MConversionStateBadge :state="state" />
        <template v-if="state !== Shared.Conversion.State.NotConvertible">
            <UButton
                label="Convert"
                size="sm"
                :trailing-icon="AppDesign.Icons.ActionConvertAsset"
                @click="handleClick"
            />
        </template>
    </div>
</template>

<script setup lang="ts">
import { useAssetConversionStore } from "~/store/AssetConversionStore.js";
import { AppDesign } from "~/design/AppDesign.js";
import * as Shared from "mod_companion_shared";

const props = defineProps<{ assetId: Shared.Asset.AssetId }>();

const conversionStore = useAssetConversionStore();
const state = computed(() => conversionStore.getState(props.assetId));

function handleClick(): void {
    useAssetConversionStore().enqueue(props.assetId);
}
</script>

<style scoped></style>
