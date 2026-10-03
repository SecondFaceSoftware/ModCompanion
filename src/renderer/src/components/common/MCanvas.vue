<template>
    <canvas :id="canvasElementId" ref="canvas" width="1000" height="1000"></canvas>
</template>

<script setup lang="ts" generic="T">
import { useElementSize, useMouseInElement, useMousePressed } from "@vueuse/core";
import { Canvas, CanvasSettings } from "~/canvas/Canvas.js";

const canvasElementId = useId();
const canvasRef = useTemplateRef("canvas");
const { width, height } = useElementSize(canvasRef);

const props = defineProps<{
    setup: (ctx: CanvasRenderingContext2D, settings: CanvasSettings) => Canvas<T>;
}>();

// TODO: Feed this from main process
const scalingFactor = 2;

const canvasSetup = ref<Canvas<T> | undefined>(undefined);
onMounted(() => {
    const canvasRefReal = canvasRef.value;
    if (!canvasRefReal) {
        return;
    }

    const ctx = canvasRefReal.getContext("2d")!;
    canvasSetup.value = props.setup(ctx, { initialCanvasWidth: 1000, initialCanvasHeight: 1000 });

    const { elementX, elementY } = useMouseInElement(canvasRef);
    useMousePressed({
        target: canvasRef,
        onPressed: (event) => {
            if ((event as any).buttons !== undefined) {
                const mouseEvent = event as MouseEvent;
                if (mouseEvent.buttons === 1) {
                    canvasSetup.value?.canvasActions.setMouse1Pressed(true);
                } else if (mouseEvent.buttons === 2) {
                    canvasSetup.value?.canvasActions.setMouse2Pressed(true);
                }
            }
        },
        onReleased: () => {
            canvasSetup.value?.canvasActions.setMouse1Pressed(false);
            canvasSetup.value?.canvasActions.setMouse2Pressed(false);
        },
    });
    watch(elementX, (x) => canvasSetup.value?.canvasActions.setMouseX(x * scalingFactor));
    watch(elementY, (y) => canvasSetup.value?.canvasActions.setMouseY(y * scalingFactor));
    watch(width, (w) => {
        if (canvasRef.value) {
            canvasRef.value.width = w * scalingFactor;
        }
        canvasSetup.value?.canvasActions.setRealWidth(w * scalingFactor);
    });
    watch(height, (h) => {
        if (canvasRef.value) {
            canvasRef.value.height = h * scalingFactor;
        }
        canvasSetup.value?.canvasActions.setRealHeight(h * scalingFactor);
    });
});
</script>

<style scoped></style>
