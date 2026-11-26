<template>
    <div>
        <template v-if="Shared.Asset.isModelAssetDef(asset.def)">
            <UButton size="sm" label="Open in HLMV" @click="() => openModelInHlmv(asset as Shared.Asset.ModelAsset)">
                <template #leading>
                    <MBitmapIcon
                        class="w-4 h-4"
                        :name="AppDesign.BitmapIcon.Launchers[Shared.Launchers.Launchers.Hlmv]"
                    />
                </template>
            </UButton>
        </template>
    </div>
</template>

<script setup lang="ts">
import * as Shared from "mod_companion_shared";
import { AppDesign } from "~/design/AppDesign.js";
import { openModelInHlmv } from "~/helper/LauncherHelper.js";

const props = defineProps<{ asset: Shared.Asset.Asset }>();
</script>

<style scoped></style>
