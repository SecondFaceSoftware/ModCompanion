export const TaskIds = {
    Fake: 0,
    AssetScan: 1,
    AssetChecksum: 2,
    BuildFgd: 3,
} as const;
export type TaskId = (typeof TaskIds)[keyof typeof TaskIds];

export const TaskNames: Record<TaskId, string> = {
    [TaskIds.Fake]: "Fake Task",
    [TaskIds.AssetScan]: "Scanning Assets",
    [TaskIds.AssetChecksum]: "Creating Asset Checksums",
    [TaskIds.BuildFgd]: "Building FGD",
};

export interface Task {
    /**
     * The number the task wants to reach.
     * Prefer to not set this to 1 or 100 as a percentage, but pass in the absolute quantity instead.
     * Percentage can be calculated presentation code.
     * Set to null to make this task indeterminate. Like when waiting for an external process that gives no insight in progress
     * */
    quantityGoal: number | null;
    taskId: TaskId;
}
