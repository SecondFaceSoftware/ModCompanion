export interface CanvasSettings {
    initialCanvasWidth: number;
    initialCanvasHeight: number;
}

export interface CanvasState {
    mouseX: number;
    mouseY: number;
    width: number;
    height: number;
    mouse1Pressed: boolean;
    mouse2Pressed: boolean;
}

export interface Canvas<T> {
    canvasActions: {
        setMouseX: (x: number) => void;
        setMouseY: (y: number) => void;
        setMouse1Pressed: (p: boolean) => void;
        setMouse2Pressed: (p: boolean) => void;
        setRealWidth: (w: number) => void;
        setRealHeight: (h: number) => void;
    };
    getCanvasState: () => CanvasState;
}

export interface CanvasSetupContext {
    onDraw: (onDrawFunc: (state: CanvasState) => void) => void;
}

export function createCanvas<T>(
    ctx: CanvasRenderingContext2D,
    settings: CanvasSettings,
    setupFunc: (setupContext: CanvasSetupContext) => void,
): Canvas<T> {
    let requestShutdown = false;
    let userDrawFunc: ((state: CanvasState) => void) | undefined;

    const canvasState: CanvasState = {
        mouseX: 0,
        mouseY: 0,
        width: settings.initialCanvasWidth,
        height: settings.initialCanvasHeight,
        mouse1Pressed: false,
        mouse2Pressed: false,
    };

    setupFunc({
        onDraw: (onDrawFunc) => (userDrawFunc = onDrawFunc),
    });

    function _drawLoop() {
        if (requestShutdown) return;
        requestAnimationFrame(_drawLoop);
        userDrawFunc?.(canvasState);
    }

    onScopeDispose(() => {
        requestShutdown = true;
    });
    _drawLoop();

    return {
        canvasActions: {
            setMouseX: (x) => (canvasState.mouseX = x - canvasState.width * 0.5),
            setMouseY: (y) => (canvasState.mouseY = y - canvasState.height * 0.5),
            setMouse1Pressed: (p) => (canvasState.mouse1Pressed = p),
            setMouse2Pressed: (p) => (canvasState.mouse2Pressed = p),
            setRealWidth: (w) => (canvasState.width = w),
            setRealHeight: (h) => (canvasState.height = h),
        },
        getCanvasState: () => canvasState,
    };
}
