<template>
    <div
        class="flex rounded bg-neutral-850 border border-accented inset-shadow-cave overflow-hidden hover:bg-neutral-800 transition-colors"
    >
        <UInput
            v-model="model"
            :placeholder="placeholder ?? 'No file'"
            class="w-full"
            variant="none"
            size="sm"
            disabled
        />
        <MFilePathInputActions :path="fullFilePath" />
        <slot name="default" />
    </div>
</template>

<script setup lang="ts">
import MFilePathInputActions from "~/components/common/MFilePathInputActions.vue";
import * as Shared from "mod_companion_shared";
import { getAppConfig } from "~/renderer-config.js";

const model = defineModel<string>({ required: false });
const props = defineProps<{ placeholder?: string; base?: Shared.FileBrowser.PathBase }>();

const fullFilePath = computed(() => Shared.FileBrowser.makeAbsolute(model.value ?? "", props.base, getAppConfig()));
</script>

<style scoped></style>
