<template>
    <UFormField class="col-span-2">
        <template #label><span class="text-nowrap">Definition File</span></template>
        <MFilePathInputNoEdit
            :model-value="asset.defFilePath"
            disabled
            class="w-full"
            size="xs"
            :base="Shared.FileBrowser.PathBases.RootRelative"
        />
    </UFormField>
</template>

<script setup lang="ts">
import * as Shared from "mod_companion_shared";

const props = defineProps<{ asset: Shared.Asset.Asset }>();
</script>

<style scoped></style>
