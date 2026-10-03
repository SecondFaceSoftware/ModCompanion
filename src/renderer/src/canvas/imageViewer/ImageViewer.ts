import { Canvas, CanvasSettings, createCanvas } from "~/canvas/Canvas.js";

export function createImageViewer(ctx: CanvasRenderingContext2D, settings: CanvasSettings): Canvas<unknown> {
    return createCanvas(ctx, settings, (setupContext) => {
        setupContext.onDraw((state) => {
            ctx.clearRect(0, 0, state.width, state.height);
        });
    });
}
