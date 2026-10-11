<template>
    <template v-if="taskStore.tasks.length > 0">
        <UPopover>
            <UButton
                size="xs"
                variant="ghost"
                color="primary"
                class="text-magenta-900 hover:bg-magenta-400 active:bg-magenta-500 font-semibold"
            >
                <template v-if="primaryTask">
                    <MTaskProgress :task="primaryTask" />
                </template>
                <template v-else>
                    <div class="flex gap-2 text-xs text-magenta-900 items-center px-2">
                        <UIcon :name="AppDesign.Icons.Loading" class="animate-spin" />
                        <span class="text-nowrap">Multiple Tasks...</span>
                    </div>
                </template>
            </UButton>
        </UPopover>
    </template>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import { useTaskStore } from "~/store/TaskStore.js";

const taskStore = useTaskStore();

const primaryTask = computed(() => (taskStore.tasks.length > 0 ? taskStore.tasks[0] : undefined));
</script>

<style scoped></style>
