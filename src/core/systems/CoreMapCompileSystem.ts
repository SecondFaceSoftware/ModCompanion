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

let queue: Shared.Paths.Path[] = [];
let workerInterval: NodeJS.Timeout | undefined = undefined;
const mapQueueStages = new Map<Shared.Paths.Path, Stage[]>();
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
    enqueue(mapPaths: Shared.Paths.Path[]): void {
        for (const mapPath of mapPaths) {
            if (mapPath.base !== Shared.Paths.PathBases.ContentMaps) {
                Logger.warning(
                    Shared.Log.Channel.MapCompile,
                    `Map`,
                    mapPath.path,
                    `is not a file path based in content maps. Skipping`,
                );
                continue;
            }

            if (queue.includes(mapPath)) {
                Logger.warning(Shared.Log.Channel.MapCompile, `Map`, mapPath.path, `is already in queue. Skipping`);
                continue;
            }

            queue.push(mapPath);
            mapQueueStages.set(mapPath, _createStages());
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
    getQueue(): Shared.Paths.Path[] {
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

function _workMap(mapPath: Shared.Paths.Path, steps: Stage[]) {
    const inProgressStepIdx = steps.findIndex((s) => s.state === Shared.Map.CompileState.InProgress);
    if (inProgressStepIdx > 0 || currentCompilePromise !== undefined) {
        return;
    }

    // Start next stage
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step.state === Shared.Map.CompileState.Idle) {
            _startStage(mapPath, i);
            return;
        }
    }
}

function _mapFinished(mapPath: Shared.Paths.Path): void {
    queue.splice(queue.indexOf(mapPath), 1);
    mapQueueStages.delete(mapPath);
    notifyQueueFunc?.(MapCompileSystem.getQueue());
}

function _startStage(mapPath: Shared.Paths.Path, stageIdx: number): void {
    const stage = mapQueueStages.get(mapPath)![stageIdx];

    currentCompilePromise = stage.action(
        mapPath,
        (msg: string) => {
            notifyLogFunc?.({ mapPath, message: msg, step: stage.step, isError: false });
        },
        (msg: string) => {
            notifyLogFunc?.({ mapPath, message: msg, step: stage.step, isError: true });
        },
    );
    stage.state = Shared.Map.CompileState.InProgress;
    notifyProgressFunc?.({ mapPath, step: stage.step, state: stage.state });

    currentCompilePromise.then(() => {
        _stageFinished(mapPath, stage);
    });
}

function _stageFinished(mapPath: Shared.Paths.Path, stage: Stage): void {
    currentCompilePromise = undefined;
    stage.state = Shared.Map.CompileState.Completed;
    notifyProgressFunc?.({ mapPath, step: stage.step, state: stage.state });
}
