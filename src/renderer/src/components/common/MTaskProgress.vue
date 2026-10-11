<template>
    <div class="flex gap-2 text-xs text-magenta-900 items-center px-2">
        <UIcon :name="AppDesign.Icons.Loading" class="animate-spin" />
        <span class="text-nowrap">{{ Shared.Task.TaskNames[props.task.taskId] }}</span>
        <UProgress v-model="quantity" :max="props.task.quantityGoal ?? 0" class="w-25 transition-none" />
        <span v-if="props.task.quantityGoal !== null" class="tabular-nums">
            {{ quantity }}/{{ task.quantityGoal }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import * as Shared from "mod_companion_shared";
import { useTaskStore } from "~/store/TaskStore.js";

const taskStore = useTaskStore();

const props = defineProps<{ task: Shared.Task.Task }>();

// UProgress progress value "null" shows an indeterminate animation https://ui3.nuxt.com/components/progress#indeterminate
const quantity = computed(() =>
    props.task.quantityGoal === null ? null : taskStore.tasksQuantities.get(props.task.taskId),
);
</script>

<style scoped></style>
