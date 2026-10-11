<template>
    <div
        class="grid grid-cols-subgrid col-span-full gap-1 bg-magenta-300 py-0.5 px-2 h-full inset-shadow-rim-halfstrong"
    >
        <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <div>
                <USeparator orientation="vertical" />
                <FooterLog />
            </div>
            <div class="flex items-center gap-1">
                <FooterTasks />
                <FooterArtifactCloudStatus />
                <template v-if="assetListStore.refreshing">
                    <FooterAssetScanProgress />
                </template>
                <template v-else>
                    <FooterConversionStatus />
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import FooterConversionStatus from "~/components/footer/FooterConversionStatus.vue";
import FooterLog from "~/components/footer/FooterLog.vue";
import { useAssetListStore } from "~/store/AssetListStore.js";
import FooterAssetScanProgress from "~/components/footer/FooterAssetScanProgress.vue";

const assetListStore = useAssetListStore();
</script>

<style scoped></style>
