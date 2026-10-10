export const TaskIds = {
    AssetScan: 0,
    AssetChecksum: 1,
} as const;
export type TaskId = (typeof TaskIds)[keyof typeof TaskIds];

export const TaskNames: Record<TaskId, string> = {
    [TaskIds.AssetScan]: "Scanning Assets",
    [TaskIds.AssetChecksum]: "Creating Asset Checksums",
};

export interface Task {
    quantityGoal: number;
    taskId: TaskId;
}
