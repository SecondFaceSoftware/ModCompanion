import { AssetId } from "./SharedAsset.js";

export enum State {
    Unknown = "unknown",
    Invalid = "invalid",
    Pending = "pending",
    PendingForced = "pending_forced",
    InProgress = "in_progress",
    Finished = "finished",
    Failed = "failed",
    NoChange = "no_change",
    NotConvertible = "not_convertible",
}

export function getConversionStateName(state: State): string {
    switch (state) {
        case State.Invalid:
            return "Invalid";
        case State.Pending:
            return "Pending";
        case State.PendingForced:
            return "Pending (Forced)";
        case State.InProgress:
            return "In Progress";
        case State.Finished:
            return "Finished";
        case State.Failed:
            return "Failed";
        case State.NoChange:
            return "No Change";
        case State.NotConvertible:
            return "Not Convertible";
        case State.Unknown:
        default:
            return "Unknown";
    }
}

export function getConversionStateColor(state: State): string {
    switch (state) {
        case State.Invalid:
        case State.Failed: {
            return "error";
        }
        case State.InProgress: {
            return "info";
        }
        case State.Finished: {
            return "success";
        }
        case State.Pending:
        case State.PendingForced:
        case State.Unknown:
        case State.NotConvertible:
        default: {
            return "neutral";
        }
    }
}

export interface SharedConversion {
    assetId: AssetId;
    state: State;
}

export interface ConversionEvent {
    assetId: AssetId;
    stateHistory: State[];
    startTime: Date;

    /** When undefined, this is ongoing */
    endTime?: Date;
    log: string;
}

export interface UpdateEvent {
    conversions: Map<AssetId, SharedConversion>;
    conversionsLastChangeTime: Date | undefined;
    events: ConversionEvent[];
    eventsLastChangeTime: Date | undefined;
    summary: SharedConversionSummary;
}

export type UpdateNotifyFunc = (event: UpdateEvent) => void;
export type ConversionStartNotifyFunc = (asset: AssetId) => void;

export interface SharedConversionGetStateIpcReport {
    conversions: Map<AssetId, SharedConversion>;
}

export interface SharedConversionSummary {
    currentStatus: "working" | "idle";
    totalSum: number;
}
