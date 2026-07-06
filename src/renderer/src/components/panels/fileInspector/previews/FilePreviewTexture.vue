<template>
    <MTextArea horiz-scroll>{{ info }}</MTextArea>
</template>

<script setup lang="ts">
import { computedAsync } from "@vueuse/core";
const props = defineProps<{ path: string }>();

const info = computedAsync(() => window.electronAPI.vtf.getInfo(props.path), undefined);
</script>

<style scoped></style>
