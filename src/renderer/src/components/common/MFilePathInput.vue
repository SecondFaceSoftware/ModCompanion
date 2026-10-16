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
                    <MFilePathInputActions :path="modelPath" />
                    <slot name="default" />
                </template>
            </div>
        </template>
    </MAcceptDrop>
</template>

<script setup lang="ts">
import { useGlobalDragging } from "~/composables/useGlobalDragging.js";
import * as Shared from "mod_companion_shared";
import MFilePathInputActions from "~/components/common/MFilePathInputActions.vue";
import { getAppConfig } from "~/renderer-config.js";

const model = defineModel<string>({ required: true });
const emit = defineEmits<{ change: [string] }>();

const modelPath = computed(() => Shared.Paths.createPath(model.value, props.base));

const props = defineProps<{ placeholder?: string; base: Shared.Paths.PathBase }>();

const { isDragging } = useGlobalDragging();
function handleDrop(droppedText: string) {
    const pathBase = Shared.Paths.guessPathBase(droppedText, getAppConfig());
    if (pathBase !== undefined) {
        const path = Shared.Paths.createPath(droppedText, pathBase);
        const pathInTargetBase = Shared.Paths.transformPathBase(path, props.base, getAppConfig());
        if (pathInTargetBase) {
            emit("change", pathInTargetBase.path);
            model.value = pathInTargetBase.path;
        }
    }
}
</script>

<style scoped></style>
