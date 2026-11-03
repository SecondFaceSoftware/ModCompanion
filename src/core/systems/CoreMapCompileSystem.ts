import { ConfigSystem } from "./CoreConfigSystem.js";
import child_process from "node:child_process";
import * as Shared from "mod_companion_shared";
import {
    MapCompilerAction,
    runDone,
    runPostcompiler,
    runVBsp,
    runVRad,
    runVVis,
} from "../helpers/CoreMapCompilerLaunchers.js";
import { Logger } from "./CoreLogSystem.js";

interface Stage {
    step: Shared.Map.CompileStep;
    state: Shared.Map.CompileState;
    action: MapCompilerAction;
}

let queue: string[] = [];
let workerInterval: NodeJS.Timeout | undefined = undefined;
const mapQueueStages = new Map<string, Stage[]>();
let currentCompilePromise: Promise<boolean> | undefined = undefined;

let paused = false;

let notifyQueueFunc: Shared.Map.QueueUpdatedNotifyFunc | undefined = undefined;
let notifyProgressFunc: Shared.Map.CompileProgressNotifyFunc | undefined = undefined;
let notifyLogFunc: Shared.Map.CompileLogNotifyFunc | undefined = undefined;

interface Props {
    queueFunc?: Shared.Map.QueueUpdatedNotifyFunc;
    progressFunc?: Shared.Map.CompileProgressNotifyFunc;
    logFunc?: Shared.Map.CompileLogNotifyFunc;
}

export const MapCompileSystem = {
    initSystem(funcs?: Props): boolean {
        notifyQueueFunc = funcs?.queueFunc;
        notifyProgressFunc = funcs?.progressFunc;
        notifyLogFunc = funcs?.logFunc;

        workerInterval = setInterval(_workQueue, 200);

        const config = ConfigSystem.getAppConfig();
        child_process.spawn(
            `chmod +x ${config.vbspExePath} ${config.postcompilerExePath} ${config.vvisExePath} ${config.vradExePath}`,
            {
                shell: true,
            },
        );

        return true;
    },
    enqueue(mapNames: string[]): void {
        for (const mapName of mapNames) {
            if (queue.includes(mapName)) {
                Logger.warning(Shared.Log.Channel.MapCompile, `Map`, mapName, `is already in queue. Skipping`);
                continue;
            }

            queue.push(mapName);
            mapQueueStages.set(mapName, _createStages());
        }

        notifyQueueFunc?.(MapCompileSystem.getQueue());
    },
    cancelQueue(): void {
        queue = [];
        mapQueueStages.clear();
    },
    setPaused(isPaused: boolean): void {
        paused = isPaused;
    },
    getQueue(): string[] {
        return queue;
    },
};

function _createStages(): Stage[] {
    return [
        {
            state: Shared.Map.CompileState.Idle,
            step: Shared.Map.CompileStep.VBsp,
            action: runVBsp,
        },
        {
            state: Shared.Map.CompileState.Idle,
            step: Shared.Map.CompileStep.Post,
            action: runPostcompiler,
        },
        {
            state: Shared.Map.CompileState.Idle,
            step: Shared.Map.CompileStep.VVis,
            action: runVVis,
        },
        {
            state: Shared.Map.CompileState.Idle,
            step: Shared.Map.CompileStep.VRad,
            action: runVRad,
        },
        {
            state: Shared.Map.CompileState.Idle,
            step: Shared.Map.CompileStep.Done,
            action: runDone,
        },
    ];
}

function _workQueue() {
    if (queue.length === 0) return;

    for (let i = 0; i < queue.length; i++) {
        const steps = mapQueueStages.get(queue[i]);
        if (steps === undefined) {
            continue;
        }

        if (!_isStepsCompleted(steps)) {
            if (!paused) {
                _workMap(queue[i], steps);
            }
        } else {
            _mapFinished(queue[i]);
        }
    }
}

function _isStepsCompleted(steps: Stage[]): boolean {
    return !steps.some((s) => s.state !== Shared.Map.CompileState.Completed);
}

function _workMap(mapName: string, steps: Stage[]) {
    const inProgressStepIdx = steps.findIndex((s) => s.state === Shared.Map.CompileState.InProgress);
    if (inProgressStepIdx > 0 || currentCompilePromise !== undefined) {
        return;
    }

    // Start next stage
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step.state === Shared.Map.CompileState.Idle) {
            _startStage(mapName, i);
            return;
        }
    }
}

function _mapFinished(mapName: string): void {
    queue.splice(queue.indexOf(mapName), 1);
    mapQueueStages.delete(mapName);
    notifyQueueFunc?.(MapCompileSystem.getQueue());
}

function _startStage(mapName: string, stageIdx: number): void {
    const stage = mapQueueStages.get(mapName)![stageIdx];

    currentCompilePromise = stage.action(
        mapName,
        (msg: string) => {
            notifyLogFunc?.({ mapName: mapName, message: msg, step: stage.step, isError: false });
        },
        (msg: string) => {
            notifyLogFunc?.({ mapName: mapName, message: msg, step: stage.step, isError: true });
        },
    );
    stage.state = Shared.Map.CompileState.InProgress;
    notifyProgressFunc?.({ mapName: mapName, step: stage.step, state: stage.state });

    currentCompilePromise.then(() => {
        _stageFinished(mapName, stage);
    });
}

function _stageFinished(mapName: string, stage: Stage): void {
    currentCompilePromise = undefined;
    stage.state = Shared.Map.CompileState.Completed;
    notifyProgressFunc?.({ mapName, step: stage.step, state: stage.state });
}
