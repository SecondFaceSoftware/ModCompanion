<template>
    <div class="w-full h-full relative grid place-items-center">
        <img src="/img/launch_stuff.svg" class="w-100 absolute bottom-2 left-5" />

        <div class="rounded-xl inset-shadow-cave bg-neutral-300 dark:bg-neutral-925 px-10 py-10 grid gap-7">
            <div class="font-semibold text-center">Add Panel</div>

            <MAddPanelsGrid button-size="xl" />
        </div>
    </div>
</template>

<script setup lang="ts">
import MAddPanelsGrid from "~/components/common/MAddPanelsGrid.vue";
</script>

<style scoped></style>
