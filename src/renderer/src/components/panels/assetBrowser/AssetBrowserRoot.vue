<template>
    <MPanelRoot no-scroll>
        <template #header>
            <div class="flex gap-1">
                <UInput
                    v-model="model.searchTerm"
                    placeholder="Search"
                    :leading-icon="AppDesign.Icons.Search"
                    class="grow"
                    autofocus
                />
                <AssetBrowserTypeSelect v-model="model.typeFilter" />
                <UButtonGroup>
                    <UTooltip text="Expand All">
                        <UButton :icon="AppDesign.Icons.ExpandVertical" @click="table?.expandAll()" />
                    </UTooltip>
                    <UTooltip text="Collapse All">
                        <UButton :icon="AppDesign.Icons.CollapseVertical" @click="table?.collapseAll()" />
                    </UTooltip>
                    <AssetBrowserRefreshButton />
                </UButtonGroup>
            </div>
        </template>
        <AssetBrowserTable ref="table" v-model="model" />
    </MPanelRoot>
</template>

<script setup lang="ts">
import AssetBrowserTable from "~/components/panels/assetBrowser/AssetBrowserTable.vue";
import AssetBrowserRefreshButton from "~/components/panels/assetBrowser/AssetBrowserRefreshButton.vue";
import { AssetBrowserModel } from "~/components/panels/assetBrowser/AssetBrowser.model.js";
import { AppDesign } from "~/design/AppDesign.js";

const model = defineModel<AssetBrowserModel>({ required: true });
const table = useTemplateRef("table");
</script>

<style scoped></style>
