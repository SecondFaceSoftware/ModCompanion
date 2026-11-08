export enum CompileStep {
    VBsp,
    Post,
    VVis,
    VRad,
    Game,
    Done,
}

export enum CompileState {
    Idle,
    InProgress,
    Completed,
}

export interface CompileLogEvent {
    mapName: string;
    step: CompileStep;
    message: string;
    isError: boolean;
}

export type QueueUpdatedNotifyFunc = (mapNames: string[]) => void;

export type CompileLogNotifyFunc = (event: CompileLogEvent) => void;

export type MapNameAndStep = string;

export function createMapPathAndStep(mapName: string, step: CompileStep): MapNameAndStep {
    return mapName + ":" + step;
}

export interface CompileProgressEvent {
    mapName: string;
    step: CompileStep;
    state: CompileState;
}

export type CompileProgressNotifyFunc = (event: CompileProgressEvent) => void;

export interface TimeReport {
    maps: Map<MapNameAndStep, number>;
    totals: Map<string, number>;
}
