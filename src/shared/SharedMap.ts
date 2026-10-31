import { Path } from "./SharedPaths.js";

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
    mapPath: Path;
    step: CompileStep;
    message: string;
    isError: boolean;
}

export type QueueUpdatedNotifyFunc = (mapPaths: Path[]) => void;

export type CompileLogNotifyFunc = (event: CompileLogEvent) => void;

export type MapPathAndStep = string;

export function createMapPathAndStep(mapSrcRelativePath: Path, step: CompileStep): MapPathAndStep {
    return mapSrcRelativePath.path + ":" + step;
}

export interface CompileProgressEvent {
    mapPath: Path;
    step: CompileStep;
    state: CompileState;
}

export type CompileProgressNotifyFunc = (event: CompileProgressEvent) => void;

export type MapPresets = Record<string, Path[]>;

export interface TimeReportMapStep {
    map: Path;
    step: CompileStep;
}

export interface TimeReport {
    maps: Map<TimeReportMapStep, number>;
    totals: Map<Path, number>;
}

export interface SharedMapSourceDir {
    dirName: string;
    vmfNames: string[];
}
