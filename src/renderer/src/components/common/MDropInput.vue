<template>
    <MAcceptDrop v-model="model" @change="handleDrop">
        <template #default="{ isOverDropZone }">
            <template v-if="isDragging">
                <div class="rounded bg-neutral-900 border border-accented inset-shadow-cave overflow-hidden">
                    <MDropAreaBg
                        class="px-2.5 py-1.5 text-center transition-colors"
                        :class="{ 'bg-neutral-800': isOverDropZone }"
                    >
                        Drop Here
                    </MDropAreaBg>
                </div>
            </template>
            <template v-else>
                <UInput v-model="model" :placeholder="placeholder" class="w-full" @change="emit('change', model ?? '')">
                    <template #leading>
                        <slot name="input-leading" />
                    </template>
                    <template #default>
                        <slot name="input-default" />
                    </template>
                    <template #trailing>
                        <slot name="input-trailing" />
                    </template>
                </UInput>
            </template>
        </template>
    </MAcceptDrop>
</template>

<script setup lang="ts">
import { useGlobalDragging } from "~/composables/useGlobalDragging.js";

const model = defineModel<string>({ required: false });
const emit = defineEmits<{ change: [string] }>();
defineProps<{ placeholder?: string }>();
const { isDragging } = useGlobalDragging();

function handleDrop(dropped: string) {
    emit("change", dropped);
    model.value = dropped;
}
</script>

<style scoped></style>
