<template>
    <div class="p-2 w-full h-full grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto]">
        <div v-if="$slots.header" class="pb-1">
            <slot name="header" />
        </div>
        <div
            class="pr-1"
            :class="noScroll ? 'overflow-y-hidden' : alwaysShowScroll ? 'overflow-y-scroll' : 'overflow-y-auto'"
        >
            <slot />
        </div>
        <div v-if="$slots.footer" class="pt-1">
            <slot name="footer" />
        </div>
    </div>
</template>

<script setup lang="ts">
// TODO: When there's no footer or header, the main content doesn't fill up the whole height
defineProps<{
    alwaysShowScroll?: boolean;
    noScroll?: boolean;
}>();
</script>

<style scoped></style>
