<template>
    <div
        ref="dragArea"
        class="relative cursor-grab select-none overflow-clip h-full"
        :class="{ 'select-grabbing': pressed }"
        @wheel="handleWheel"
    >
        <div class="absolute w-full h-full checkerboard" />
        <img :src="src" class="origin-top-left" :style="transformStyle" draggable="false" />
        <div
            class="pt-4 opacity-25 hover:opacity-100 transition-opacity absolute bottom-0 left-0 right-0 flex justify-center from-transparent to-neutral-950 bg-linear-to-b"
        >
            <div class="inline-flex gap-1 bg-neutral-800 shadow p-1 rounded-t-xl">
                <UButton
                    :icon="AppDesign.Icons.ImageViewer_Action_Fill"
                    variant="subtle"
                    @click="handleResetTransform"
                />
                <!--                <UFieldGroup>-->
                <!--                    <UButton label="R" variant="subtle" />-->
                <!--                    <UButton label="G" variant="subtle" />-->
                <!--                    <UButton label="B" variant="subtle" />-->
                <!--                    <UButton label="A" variant="subtle" />-->
                <!--                </UFieldGroup>-->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMouse, useMousePressed } from "@vueuse/core";
import { AppDesign } from "~/design/AppDesign.js";

const props = defineProps<{ src: string }>();

const transformX = ref(0);
const transformY = ref(0);
const zoom = ref(1);

const minZoom = 0.1;
const maxZoom = 5;

function reset() {
    transformX.value = 0;
    transformY.value = 0;
    zoom.value = 1;
}
watch(() => props.src, reset);

const transformStyle = computed(
    () => `transform: translate(${transformX.value}px, ${transformY.value}px) scale(${zoom.value})`,
);

const dragArea = useTemplateRef("dragArea");
const { x, y } = useMouse();
const { pressed } = useMousePressed({ target: dragArea });

watch(x, (newX, oldX) => {
    if (pressed.value) {
        transformX.value += newX - oldX;
    }
});
watch(y, (newY, oldY) => {
    if (pressed.value) {
        transformY.value += newY - oldY;
    }
});

function handleWheel(event: WheelEvent) {
    if (!dragArea.value) return;

    const rect = dragArea.value.getBoundingClientRect();

    const mx = x.value - rect.left;
    const my = y.value - rect.top;

    const dir = Math.sign(event.deltaY);
    const oldZoom = zoom.value;
    let newZoom = oldZoom * (1 - dir * 0.2);
    newZoom = Math.min(Math.max(minZoom, newZoom), maxZoom);

    const localX = (mx - transformX.value) / oldZoom;
    const localY = (my - transformY.value) / oldZoom;

    transformX.value = mx - localX * newZoom;
    transformY.value = my - localY * newZoom;

    zoom.value = newZoom;
}

function handleResetTransform() {
    transformX.value = 0;
    transformY.value = 0;
    zoom.value = 1;
}
</script>

<style scoped>
.checkerboard {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='32' height='32' fill='white'/><rect x='32' y='32' width='32' height='32' fill='white'/></svg>");
    opacity: 0.02;
}
</style>
