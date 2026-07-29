<template>
    <USelect
        v-model="model"
        :items="items"
        value-key="id"
        multiple
        class="min-w-32"
        placeholder="No Filter"
        :icon="AppDesign.Icons.Filter"
    />
</template>

<script setup lang="ts">
import { AppDesign, getAssetTypeIcon } from "~/design/AppDesign.js";
import * as Shared from "mod_companion_shared";

const model = defineModel<Shared.Asset.Type[]>({ default: [] });

const items = Shared.Asset.ValidTypes.map((k) => ({
    id: k,
    label: Shared.Asset.getAssetTypeName(k),
    icon: getAssetTypeIcon(k),
}));
</script>

<style scoped></style>
