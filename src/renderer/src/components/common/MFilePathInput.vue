<template>
    <MAcceptDrop @change="handleDrop">
        <template #default="{ isOverDropZone }">
            <div
                class="flex rounded bg-neutral-900 border border-accented inset-shadow-cave overflow-hidden hover:bg-neutral-850"
                :dir="isDragging ? 'rtl' : 'ltr'"
            >
                <template v-if="isDragging">
                    <MDropAreaBg
                        class="px-2.5 py-1.5 text-center transition-colors"
                        :class="{ 'bg-neutral-800': isOverDropZone }"
                    >
                        Drop Here
                    </MDropAreaBg>
                </template>
                <template v-else>
                    <UInput
                        v-model="model"
                        :placeholder="placeholder ?? 'Choose or drop file...'"
                        class="w-full"
                        variant="none"
                        size="sm"
                        @change="emit('change', model)"
                    />
                    <MFilePathInputActions :path="model" />
                    <slot name="default" />
                </template>
            </div>
        </template>
    </MAcceptDrop>
</template>

<script setup lang="ts">
import { useGlobalDragging } from "~/composables/useGlobalDragging.js";
import { getAppConfig } from "~/renderer-config.js";
import * as Shared from "mod_companion_shared";
import MFilePathInputActions from "~/components/common/MFilePathInputActions.vue";

const model = defineModel<Shared.Paths.Path>({ required: false });
const emit = defineEmits<{ change: [string] }>();

const props = defineProps<{ placeholder?: string }>();

const { isDragging } = useGlobalDragging();
function handleDrop(dropped: string) {
    emit("change", dropped);
    model.value = dropped;
}
</script>

<style scoped></style>
