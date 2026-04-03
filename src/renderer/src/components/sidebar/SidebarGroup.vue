<template>
    <MPaper class="rounded">
        <div class="flex items-start pl-3 pr-1 pb-1 pt-1">
            <span class="text-xs text-neutral-900 dark:text-neutral-200 select-none grow">
                {{ heading }}
            </span>

            <slot name="hint" />
        </div>
        <div class="grid gap-1 content-start">
            <slot name="default" />
        </div>
    </MPaper>
</template>

<script setup lang="ts">
defineProps<{ heading: string }>();
</script>

<style scoped></style>
