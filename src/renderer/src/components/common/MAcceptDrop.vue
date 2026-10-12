<template>
    <div ref="dropZoneRef" @dragover="(e) => e.preventDefault()">
        <slot :is-over-drop-zone="isOverDropZone" />
    </div>
</template>

<script setup lang="ts">
import { useDropZone } from "@vueuse/core";
import { handleDrop } from "~/helper/DragDropData.js";

const emit = defineEmits<{ change: [string] }>();
defineSlots<{
    default(props: { isOverDropZone: boolean }): any;
}>();

const dropZoneRef = ref<HTMLDivElement>();
async function onDrop(files: File[] | null, event: DragEvent) {
    const p = await handleDrop(files, event);
    if (p !== undefined) {
        emit("change", p);
    }
}
const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop,
    onOver: (files, event) => {
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "link";
        }
        event.preventDefault();
    },
    preventDefaultForUnhandled: false,
});
</script>

<style scoped></style>
