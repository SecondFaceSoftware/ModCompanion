<template>
    <MInteractiveImageViewer :src="`file://${absPath}`" />
</template>

<script setup lang="ts">
import * as Shared from "mod_companion_shared";
import MInteractiveImageViewer from "~/components/common/MInteractiveImageViewer.vue";
import { getAppConfig } from "~/renderer-config.js";

const props = defineProps<{ path: Shared.Paths.Path }>();

// TODO: Handle the null case
const absPath = computed(
    () => Shared.Paths.transformPathBase(props.path, Shared.Paths.PathBases.Absolute, getAppConfig())?.path,
);
</script>

<style scoped></style>
