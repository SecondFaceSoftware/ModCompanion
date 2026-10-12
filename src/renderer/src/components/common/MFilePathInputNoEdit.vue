<template>
    <div
        class="flex rounded bg-neutral-850 border border-accented inset-shadow-cave overflow-hidden hover:bg-neutral-800 transition-colors"
    >
        <UInput
            :model-value="props.path.path"
            :placeholder="placeholder ?? 'No file'"
            class="w-full"
            variant="none"
            size="sm"
            disabled
        />
        <MFilePathInputActions :path="props.path" />
        <slot name="default" />
    </div>
</template>

<script setup lang="ts">
import MFilePathInputActions from "~/components/common/MFilePathInputActions.vue";
import * as Shared from "mod_companion_shared";
import { getAppConfig } from "~/renderer-config.js";

const props = defineProps<{ placeholder?: string; path: Shared.Paths.Path }>();
</script>

<style scoped></style>
