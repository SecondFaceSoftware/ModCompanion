export const TaskIds = {
    Fake: 0,
    AssetScan: 1,
    AssetChecksum: 2,
} as const;
export type TaskId = (typeof TaskIds)[keyof typeof TaskIds];

export const TaskNames: Record<TaskId, string> = {
    [TaskIds.Fake]: "Fake Task",
    [TaskIds.AssetScan]: "Scanning Assets",
    [TaskIds.AssetChecksum]: "Creating Asset Checksums",
};

export interface Task {
    quantityGoal: number;
    taskId: TaskId;
}
