<template>
    <UFormField class="col-span-2">
        <template #label><span class="text-nowrap">Definition File</span></template>
        <MFilePathInputNoEdit :path="editPath" disabled class="w-full" size="xs" />
    </UFormField>
</template>

<script setup lang="ts">
import * as Shared from "mod_companion_shared";

const props = defineProps<{ asset: Shared.Asset.Asset }>();

const editPath = computed(() => Shared.Paths.createPath(props.asset.defFilePath ?? "", Shared.Paths.PathBases.Root));
</script>

<style scoped></style>
