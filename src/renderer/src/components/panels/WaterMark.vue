<template>
    <div class="@container w-full h-full grid grid-cols-1 grid-rows-1 p-4 overflow-hidden">
        <div
            class="w-full h-full grid grid-cols-1 @2xl:grid-cols-[minmax(30rem,minmax(0m1fr))_minmax(minmax(0,1fr),10rem)] @3xl:grid-cols-[minmax(30rem,minmax(0,1fr))_minmax(minmax(0,1fr),25rem)] grid-rows-[20rem_minmax(0,1fr)] bg-neutral-850 rounded-3xl"
        >
            <!-- Positioned before all other elements so it remains in the background -->
            <img
                class="col-start-2 row-start-1 row-end-3 self-end justify-self-end max-h-6/12 @3xl:max-h-10/12 @5xl:max-h-full hidden @lg:block select-none"
                src="/img/art/utylity_watermark.png"
            />
            <span
                class="col-start-2 row-start-2 self-end justify-self-center text-center mb-4 text-sm text-muted font-semibold hidden @2xl:block select-none"
            >
                Artwork by Tyson Tan
            </span>

            <div class="col-start-1 col-end-3 row-start-1 px-10 @5xl:px-20 my-auto select-none">
                <h1
                    class="text-5xl @4xl:text-7xl text-neutral-100 font-puff font-bold text-shadow-watermark-logo text-nowrap"
                >
                    MOD COMPANION
                </h1>
                <span class="text-lity-skin text-xl font-puff text-shadow-lg/50">A modder's best friend</span>
            </div>

            <nav
                class="col-start-1 row-start-2 row-end-3 max-w-200 self-end rounded-xl inset-shadow-cave bg-neutral-900 m-10 p-5 @4xl:p-10 grid gap-4 @4xl:gap-7"
            >
                <header class="font-semibold select-none text-magenta-300">Get started by adding a panel:</header>

                <div class="grid grid-cols-1 @5xl:grid-cols-2 gap-2">
                    <MAddPanelsGrid button-size="xl" />
                </div>
            </nav>
        </div>
    </div>
</template>

<script setup lang="ts">
import MAddPanelsGrid from "~/components/common/MAddPanelsGrid.vue";
</script>

<style scoped></style>
