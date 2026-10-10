import * as Shared from "mod_companion_shared";

let notifyStartTaskFunc: ((task: Shared.Task.Task) => void) | undefined = undefined;
let notifyUpdateTaskFunc: ((taskId: Shared.Task.TaskId, quantity: number) => void) | undefined = undefined;
let notifyEndTaskFunc: ((taskId: Shared.Task.TaskId) => void) | undefined = undefined;

interface Props {
    startTaskFunc: (task: Shared.Task.Task) => void;
    updateTaskFunc: (taskId: Shared.Task.TaskId, quantity: number) => void;
    endTaskFunc: (taskId: Shared.Task.TaskId) => void;
}

export const TaskSystem = {
    initSystem({ startTaskFunc, updateTaskFunc, endTaskFunc }: Props): boolean {
        notifyStartTaskFunc = startTaskFunc;
        notifyUpdateTaskFunc = updateTaskFunc;
        notifyEndTaskFunc = endTaskFunc;

        return true;
    },

    startTask(task: Shared.Task.Task) {
        notifyStartTaskFunc?.(task);
    },

    updateTask(taskId: Shared.Task.TaskId, quantity: number) {
        notifyUpdateTaskFunc?.(taskId, quantity);
    },

    endTask(taskId: Shared.Task.TaskId) {
        notifyEndTaskFunc?.(taskId);
    },
};
