<template>
    <MTextArea horiz-scroll>{{ text }}</MTextArea>
</template>

<script setup lang="ts">
import * as Shared from "mod_companion_shared";
import { computedAsync } from "@vueuse/core";

const props = defineProps<{ path: Shared.Paths.Path }>();

const text = computedAsync(() => window.electronAPI.file.readString(props.path), "");
</script>

<style scoped></style>
