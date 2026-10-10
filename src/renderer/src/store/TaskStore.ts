import * as Shared from "mod_companion_shared";
import { defineStore } from "pinia";

export const useTaskStore = defineStore("task-store", () => {
    const tasks = ref<Shared.Task.Task[]>([]);
    const tasksQuantities = reactive<Map<Shared.Task.TaskId, number>>(new Map());

    window.electronAPI.task.subscribeStartTask((task) => {
        const existingTask = tasks.value.find((t) => t.taskId == task.taskId);
        if (existingTask) {
            existingTask.quantityGoal = task.quantityGoal;
            tasksQuantities.set(task.taskId, 0);
        } else {
            tasks.value = [...tasks.value, task];
            tasksQuantities.set(task.taskId, 0);
        }
    });

    window.electronAPI.task.subscribeUpdateTask((taskId, quantity) => {
        tasksQuantities.set(taskId, quantity);
    });

    window.electronAPI.task.subscribeEndTask((taskId) => {
        const existingTaskIndex = tasks.value.findIndex((t) => t.taskId == taskId);
        if (existingTaskIndex > -1) {
            tasks.value = tasks.value.toSpliced(existingTaskIndex, 1);
            tasksQuantities.set(taskId, 0);
        }
    });

    return { tasks, tasksQuantities };
});
