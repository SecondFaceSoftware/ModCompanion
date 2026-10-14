<template>
    <div v-for="[key, name] in displayNames.entries()" :key="key.path" class="text-xs text-muted">{{ name }}</div>
</template>
<script setup lang="ts">
import * as Shared from "mod_companion_shared";
import { useMapDisplayNames } from "~/composables/useMapDisplayNames.js";

const props = defineProps<{ maps: Shared.Paths.Path[] }>();

const displayNames = computed(() => useMapDisplayNames(props.maps));
</script>

<style scoped></style>
