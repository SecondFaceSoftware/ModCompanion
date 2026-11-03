import { useEvent } from "~/composables/useEvent.js";
import * as Shared from "mod_companion_shared";

export interface RectAndIdx {
    idx: number;
    rect: Shared.Vtf.SharedVtfHotspotRect;
}

function createRect(pos1: Vector2, pos2: Vector2): Shared.Vtf.SharedVtfHotspotRect {
    const biggerX1 = pos1.x > pos2.x;
    const biggerY1 = pos1.y > pos2.y;

    return {
        x0: biggerX1 ? pos2.x : pos1.x,
        y0: biggerY1 ? pos2.y : pos1.y,
        x1: biggerX1 ? pos1.x : pos2.x,
        y1: biggerY1 ? pos1.y : pos2.y,
    };
}

export enum HotspotEditMode {
    Select,
    Draw,
    Delete,
}

const EDGE_WEIGHT = 4;
const EDGE_SELECT_WEIGHT = 20;
const EDGE_COUNT = 4;

const ZOOM = 0.98;

const tileColors = Array.from({ length: 128 }, (_, i) => {
    const hue = Math.round((i * 360) / 32 + Math.random() * 6 - 3);

    const saturation = Math.round(55 + Math.random() * 15);
    const lightness = Math.round(45 + Math.random() * 12);

    return `hsl(${hue} ${saturation}% ${lightness}% / 0.5)`;
});

class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

function createHotspotEditor(ctx: CanvasRenderingContext2D, initialCanvasWidth: number, initialCanvasHeight: number) {
    let requestShutdown = false;
    let mouseX = 0;
    let mouseY = 0;
    let texture: HTMLImageElement | undefined = undefined;
    let canvasWidth = initialCanvasWidth;
    let canvasHeight = initialCanvasHeight;
    let mouse1Pressed = false;
    let mouse2Pressed = false;
    let mouseXTexture = 0;
    let mouseYTexture = 0;
    let pendingSave = false;
    let gridSnap = 16;
    let gridShow = false;
    let rectTiles = false;

    let drawStartPos: Vector2 | undefined = undefined;
    let drawEndPos: Vector2 | undefined = undefined;

    let rects: Shared.Vtf.SharedVtfHotspotRect[] = [];

    // Edge id is rect index * 4 (because 4 edges) + edge index.
    // Edge index is top bottom left right.
    // Makes it easier to group vertical and horizontal
    let hoveredEdge: number | undefined = undefined;
    let grabbedEdge: number | undefined = undefined;
    let selectedRectIdx: undefined | number = undefined;

    let editMode = HotspotEditMode.Select;
    let showIds = false;

    const changedEvent = useEvent<Shared.Vtf.SharedVtfHotspotRect[]>();
    const selectedEvent = useEvent<RectAndIdx | undefined>();

    function _snapToGrid(n: number): number {
        return Math.round(Math.round(n) / gridSnap) * gridSnap;
    }

    function _drawLoop(): void {
        if (pendingSave) {
            changedEvent.call(rects);
            pendingSave = false;
        }
        if (requestShutdown) return;
        requestAnimationFrame(_drawLoop);

        _update();
        _draw();
    }

    function _update(): void {
        mouseXTexture = _canvasToTextureSpaceX(mouseX);
        mouseYTexture = _canvasToTextureSpaceY(mouseY);

        _updateFixupRects();

        if (editMode === HotspotEditMode.Select) {
            _updateSelect();
        } else if (editMode === HotspotEditMode.Draw) {
            _updateDraw();
        } else if (editMode === HotspotEditMode.Delete) {
            _updateDelete();
        }
    }

    function _updateFixupRects(): void {
        for (const rect of rects) {
            if (rect.x0 > rect.x1) {
                const max = rect.x0;
                rect.x0 = rect.x1;
                rect.x1 = max;
            }
            if (rect.y0 > rect.y1) {
                const max = rect.y0;
                rect.y0 = rect.y1;
                rect.y1 = max;
            }
        }
    }

    function _updateSelectRects(): void {
        if (mouse1Pressed) {
            for (let rectIdx = 0; rectIdx < rects.length; rectIdx++) {
                if (_isPointInRect(mouseXTexture, mouseYTexture, rects[rectIdx])) {
                    if (selectedRectIdx === rectIdx) return;
                    selectedRectIdx = rectIdx;
                    selectedEvent.call({ idx: rectIdx, rect: rects[rectIdx] });
                    return;
                }
            }
            selectedRectIdx = undefined;
            selectedEvent.call(undefined);
        }
    }

    function _updateSelect(): void {
        _updateGrabbedEdge();
        if (grabbedEdge === undefined) {
            _updateSelectRects();
        } else {
            _updateGrab(grabbedEdge);
        }
    }

    function _updateDraw(): void {
        if (mouse1Pressed) {
            if (!drawStartPos) {
                drawStartPos = new Vector2(mouseXTexture, mouseYTexture);
                drawStartPos.x = _snapToGrid(drawStartPos.x);
                drawStartPos.y = _snapToGrid(drawStartPos.y);
            } else {
                drawEndPos = new Vector2(mouseXTexture, mouseYTexture);
                drawEndPos.x = _snapToGrid(drawEndPos.x);
                drawEndPos.y = _snapToGrid(drawEndPos.y);
            }
        } else if (drawStartPos && drawEndPos) {
            const newRect = createRect(drawStartPos, drawEndPos);
            if (newRect.x0 === newRect.x1 || newRect.y0 === newRect.y1) return;

            rects.push(newRect);
            drawStartPos = undefined;
            drawEndPos = undefined;
            pendingSave = true;
        }
    }
    function _updateDelete(): void {
        for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];
            const hovered = _isPointInRect(mouseXTexture, mouseYTexture, rect);
            if (hovered && mouse1Pressed) {
                rects.splice(i, 1);
                pendingSave = true;
                break;
            }
        }
    }

    function _updateGrab(edge: number): void {
        const edgeIdx = edge % EDGE_COUNT;

        const rectIdx = Math.floor(edge / EDGE_COUNT);
        const mx = _snapToGrid(Math.max(0, Math.min(mouseXTexture, texture?.width ?? canvasWidth)));
        const my = _snapToGrid(Math.max(0, Math.min(mouseYTexture, texture?.height ?? canvasHeight)));

        if (edgeIdx === 0) {
            rects[rectIdx].y0 = my;
        } else if (edgeIdx === 1) {
            rects[rectIdx].y1 = my;
        } else if (edgeIdx === 2) {
            rects[rectIdx].x0 = mx;
        } else if (edgeIdx === 3) {
            rects[rectIdx].x1 = mx;
        }
    }

    function _updateGrabbedEdge(): void {
        if (!mouse1Pressed) {
            hoveredEdge = undefined;
            grabbedEdge = undefined;
        }

        if (selectedRectIdx === undefined) return;

        const rect = rects[selectedRectIdx];
        const edgeBase = selectedRectIdx * EDGE_COUNT;
        const hoveredTop = _isPointInAabb(
            mouseXTexture,
            mouseYTexture,
            rect.x0,
            rect.y0 - _canvasToTextureSpaceY(EDGE_SELECT_WEIGHT),
            rect.x1,
            rect.y0,
        );
        if (hoveredTop) {
            hoveredEdge = edgeBase;
            if (mouse1Pressed) grabbedEdge = hoveredEdge;
            return;
        }

        const hoveredBottom = _isPointInAabb(
            mouseXTexture,
            mouseYTexture,
            rect.x0,
            rect.y1,
            rect.x1,
            rect.y1 + _canvasToTextureSpaceY(EDGE_SELECT_WEIGHT),
        );
        if (hoveredBottom) {
            hoveredEdge = edgeBase + 1;
            if (mouse1Pressed) grabbedEdge = hoveredEdge;
            return;
        }

        const hoveredLeft = _isPointInAabb(
            mouseXTexture,
            mouseYTexture,
            rect.x0 - _canvasToTextureSpaceX(EDGE_SELECT_WEIGHT),
            rect.y0,
            rect.x0,
            rect.y1,
        );
        if (hoveredLeft) {
            hoveredEdge = edgeBase + 2;
            if (mouse1Pressed) grabbedEdge = hoveredEdge;
            return;
        }

        const hoveredRight = _isPointInAabb(
            mouseXTexture,
            mouseYTexture,
            rect.x1,
            rect.y0,
            rect.x1 + _canvasToTextureSpaceX(EDGE_SELECT_WEIGHT),
            rect.y1,
        );
        if (hoveredRight) {
            hoveredEdge = edgeBase + 3;
            if (mouse1Pressed) grabbedEdge = hoveredEdge;
            return;
        }
    }

    function _draw() {
        ctx.resetTransform();
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const translW = canvasWidth * (1 - ZOOM) * 0.5;
        const translH = canvasHeight * (1 - ZOOM) * 0.5;
        ctx.translate(translW, translH);
        ctx.scale(ZOOM, ZOOM);

        if (texture) {
            ctx.drawImage(texture, 0, 0, canvasWidth, canvasHeight);
        } else {
            return;
        }

        _drawGrid();

        // ctx.fillStyle = "black";
        // ctx.fillRect(mouseX - 4, mouseY - 4, 4, 4);

        for (let rectIdx = 0; rectIdx < rects.length; rectIdx++) {
            _drawRect(rects[rectIdx], rectIdx);
        }

        if (editMode === HotspotEditMode.Draw) {
            if (mouse1Pressed && drawStartPos && drawEndPos) {
                ctx.fillStyle = "transparent";
                ctx.strokeStyle = "rgb(255 255 255 / 0.8)";
                ctx.strokeRect(
                    _textureToCanvasSpaceX(drawStartPos.x),
                    _textureToCanvasSpaceY(drawStartPos.y),
                    _textureToCanvasSpaceX(drawEndPos.x - drawStartPos.x),
                    _textureToCanvasSpaceY(drawEndPos.y - drawStartPos.y),
                );
            }
        }
    }

    function _drawGrid(): void {
        if (!gridShow) return;

        const texWidth = texture?.width;
        const texHeight = texture?.height;
        if (texWidth === undefined || texHeight === undefined) return;

        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgb(255 255 255 / 0.5)";
        for (let x = 0; x <= texWidth; x += gridSnap) {
            ctx.moveTo(_textureToCanvasSpaceX(x), 0);
            ctx.lineTo(_textureToCanvasSpaceX(x), _textureToCanvasSpaceY(texHeight));
            // Logger.debug(Shared.Log.Channel.Hotspot, "x: ", x);
        }
        for (let y = 0; y <= texHeight; y += gridSnap) {
            ctx.moveTo(0, _textureToCanvasSpaceY(y));
            ctx.lineTo(_textureToCanvasSpaceX(texWidth), _textureToCanvasSpaceY(y));
        }

        ctx.stroke();
    }

    function _drawRect(rect: Shared.Vtf.SharedVtfHotspotRect, rectIdx: number): void {
        const hoveredMiddle = _isPointInRect(mouseXTexture, mouseYTexture, rect);

        // ctx.strokeStyle = "rgb(255 255 255 / 0.2)";
        ctx.fillStyle = rectTiles ? tileColors[rectIdx] : "transparent";
        if (editMode === HotspotEditMode.Delete && hoveredMiddle) {
            ctx.fillStyle = "rgb(255 100 100 / 0.5)";
        } else if (editMode === HotspotEditMode.Select) {
            if (selectedRectIdx === rectIdx) {
                ctx.fillStyle = "rgb(255 205 255 / 0.2)";
            }
        }

        ctx.rect(
            _textureToCanvasSpaceX(rect.x0),
            _textureToCanvasSpaceY(rect.y0),
            _textureToCanvasSpaceX(rect.x1 - rect.x0),
            _textureToCanvasSpaceY(rect.y1 - rect.y0),
        );
        ctx.fill();

        _drawRectEdges(
            rect,
            rectIdx,
            hoveredEdge == rectIdx * EDGE_COUNT,
            hoveredEdge == rectIdx * EDGE_COUNT + 1,
            hoveredEdge == rectIdx * EDGE_COUNT + 2,
            hoveredEdge == rectIdx * EDGE_COUNT + 3,
        );

        if (showIds) {
            _drawRectId(rect, rectIdx);
        }
    }

    function _drawRectId(rect: Shared.Vtf.SharedVtfHotspotRect, rectIdx: number): void {
        // Logger.debug(Shared.Log.Channel.Hotspot, "Drawing rect id", rectIdx);

        const w = rect.x1 - rect.x0;
        const h = rect.y1 - rect.y0;
        const rectMinSize = Math.min(70, w > h ? _textureToCanvasSpaceX(w) : _textureToCanvasSpaceY(h));
        ctx.textAlign = "center";
        ctx.font = `${rectMinSize}px Inter`;
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgb(255 100 255 / 0.7)";
        const rectCenterX = _textureToCanvasSpaceX(rect.x0 + w * 0.5);
        const rectCenterY = _textureToCanvasSpaceY(rect.y0 + h * 0.5);
        ctx.fillText(`${rectIdx}`, rectCenterX, rectCenterY);
    }

    function _drawRectEdges(
        rect: Shared.Vtf.SharedVtfHotspotRect,
        rectIdx: number,
        hoveredTop: boolean,
        hoveredBottom: boolean,
        hoveredLeft: boolean,
        hoveredRight: boolean,
    ) {
        const selected = selectedRectIdx === rectIdx && editMode === HotspotEditMode.Select;
        function applyEdgeDrawStyles(edgeHovered: boolean) {
            if (selected) {
                ctx.strokeStyle = "rgb(255 255 255 / 0.7)";
                if (edgeHovered && mouse1Pressed) {
                    ctx.strokeStyle = "rgb(255 100 255 / 0.7)";
                }
                ctx.lineCap = "butt";
                ctx.lineWidth = EDGE_SELECT_WEIGHT;
            } else {
                ctx.strokeStyle = "rgb(255 255 255 / 0.3)";
                ctx.lineWidth = EDGE_WEIGHT;
            }
        }

        {
            // Top
            ctx.beginPath();
            if (selected) {
                ctx.moveTo(_textureToCanvasSpaceX(rect.x0), _textureToCanvasSpaceY(rect.y0) - EDGE_SELECT_WEIGHT * 0.5);
                ctx.lineTo(_textureToCanvasSpaceX(rect.x1), _textureToCanvasSpaceY(rect.y0) - EDGE_SELECT_WEIGHT * 0.5);
            } else {
                ctx.moveTo(_textureToCanvasSpaceX(rect.x0), _textureToCanvasSpaceY(rect.y0));
                ctx.lineTo(_textureToCanvasSpaceX(rect.x1), _textureToCanvasSpaceY(rect.y0));
            }

            applyEdgeDrawStyles(hoveredTop);
            ctx.stroke();
        }

        {
            // Bottom
            ctx.beginPath();
            if (selected) {
                ctx.moveTo(_textureToCanvasSpaceX(rect.x0), _textureToCanvasSpaceY(rect.y1) + EDGE_SELECT_WEIGHT * 0.5);
                ctx.lineTo(_textureToCanvasSpaceX(rect.x1), _textureToCanvasSpaceY(rect.y1) + EDGE_SELECT_WEIGHT * 0.5);
            } else {
                ctx.moveTo(_textureToCanvasSpaceX(rect.x0), _textureToCanvasSpaceY(rect.y1));
                ctx.lineTo(_textureToCanvasSpaceX(rect.x1), _textureToCanvasSpaceY(rect.y1));
            }

            applyEdgeDrawStyles(hoveredBottom);
            ctx.stroke();
        }

        {
            // Left
            ctx.beginPath();
            if (selected) {
                ctx.moveTo(_textureToCanvasSpaceX(rect.x0) - EDGE_SELECT_WEIGHT * 0.5, _textureToCanvasSpaceY(rect.y0));
                ctx.lineTo(_textureToCanvasSpaceX(rect.x0) - EDGE_SELECT_WEIGHT * 0.5, _textureToCanvasSpaceY(rect.y1));
            } else {
                ctx.moveTo(_textureToCanvasSpaceX(rect.x0), _textureToCanvasSpaceY(rect.y0));
                ctx.lineTo(_textureToCanvasSpaceX(rect.x0), _textureToCanvasSpaceY(rect.y1));
            }

            applyEdgeDrawStyles(hoveredLeft);
            ctx.stroke();
        }

        {
            // Right
            ctx.beginPath();
            if (selected) {
                ctx.moveTo(_textureToCanvasSpaceX(rect.x1) + EDGE_SELECT_WEIGHT * 0.5, _textureToCanvasSpaceY(rect.y0));
                ctx.lineTo(_textureToCanvasSpaceX(rect.x1) + EDGE_SELECT_WEIGHT * 0.5, _textureToCanvasSpaceY(rect.y1));
            } else {
                ctx.moveTo(_textureToCanvasSpaceX(rect.x1), _textureToCanvasSpaceY(rect.y0));
                ctx.lineTo(_textureToCanvasSpaceX(rect.x1), _textureToCanvasSpaceY(rect.y1));
            }

            applyEdgeDrawStyles(hoveredRight);
            ctx.stroke();
        }
    }

    function _isPointInAabb(pointX: number, pointY: number, x0: number, y0: number, x1: number, y1: number) {
        return pointX >= x0 && pointX <= x1 && pointY >= y0 && pointY <= y1;
    }

    function _isPointInRect(pointX: number, pointY: number, rect: Shared.Vtf.SharedVtfHotspotRect) {
        return pointX >= rect.x0 && pointX <= rect.x1 && pointY >= rect.y0 && pointY <= rect.y1;
    }

    function _canvasToTextureSpaceX(cX: number) {
        if (!texture) return cX;
        return (cX / canvasWidth) * texture.width;
    }
    function _canvasToTextureSpaceY(cY: number) {
        if (!texture) return cY;
        return (cY / canvasHeight) * texture.height;
    }
    function _textureToCanvasSpaceX(tX: number) {
        if (!texture) return tX;
        return (tX / texture.width) * canvasWidth;
    }
    function _textureToCanvasSpaceY(tY: number) {
        if (!texture) return tY;
        return (tY / texture.height) * canvasHeight;
    }

    function updateTexture(src: string, width: number, height: number) {
        const img = new Image(width, height);
        img.src = src;
        texture = img;
    }

    function updateMouseX(x: number): void {
        const translW = canvasWidth * (1 - ZOOM) * 0.5;
        mouseX = x / ZOOM - translW;
    }
    function updateMouseY(y: number): void {
        const translH = canvasHeight * (1 - ZOOM) * 0.5;
        mouseY = y / ZOOM - translH;
    }
    function updateMouse1Pressed(pressed: boolean): void {
        mouse1Pressed = pressed;
    }
    function updateMouse2Pressed(pressed: boolean): void {
        mouse2Pressed = pressed;
    }
    function updateRealWidth(w: number): void {
        canvasWidth = w;
    }
    function updateRealHeight(h: number): void {
        canvasHeight = h;
    }
    function updateEditMode(mode: HotspotEditMode): void {
        editMode = mode;
    }
    function updateShowIds(shouldShowIds: boolean): void {
        showIds = shouldShowIds;
    }
    function updateRects(newRects: Shared.Vtf.SharedVtfHotspotRect[]): void {
        grabbedEdge = undefined;
        drawStartPos = undefined;
        drawEndPos = undefined;
        pendingSave = false;

        if (rects.length !== newRects.length) {
            selectedEvent.call(undefined);
            selectedRectIdx = undefined;
        }

        rects = newRects;
    }
    function updateRectFlags(rectIdx: number, flags: Shared.Vtf.SharedVtfHotspotRectFlags | undefined): void {
        rects[rectIdx].flags = flags;
        pendingSave = true;
    }
    function updateGridSnap(gridSnapSize: number): void {
        gridSnap = gridSnapSize;
    }
    function updateGridShow(show: boolean): void {
        gridShow = show;
    }
    function updateRectTiles(tiles: boolean): void {
        rectTiles = tiles;
    }
    function shutdown(): void {
        requestShutdown = true;
    }

    onScopeDispose(() => {
        requestShutdown = true;
    });
    _drawLoop();

    return {
        updateTexture,
        updateMouseX,
        updateMouseY,
        updateMouse1Pressed,
        updateMouse2Pressed,
        updateRealWidth,
        updateRealHeight,
        updateEditMode,
        updateShowIds,
        updateRects,
        updateRectFlags,
        updateGridSnap,
        updateGridShow,
        updateRectTiles,
        shutdown,
        changedEvent,
        selectedEvent,
    };
}

export default createHotspotEditor;

export type HotspotEditor = ReturnType<typeof createHotspotEditor>;
