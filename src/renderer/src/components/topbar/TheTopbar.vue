<template>
    <nav class="grid grid-cols-[auto_1fr_auto] p-1 border-b border-b-neutral-800 app-region-drag overflow-x-clip">
        <div class="flex">
            <TopbarModcomp />
            <TopbarAssets />
            <TopbarTools />

            <USeparator orientation="vertical" class="mx-1 py-1" />

            <TopbarWorkspaces />
        </div>

        <div class="app-region-drag-important"></div>

        <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-1">
            <TopbarFind />
            <TopbarRun />
            <TopbarSystemButtons />
        </div>
    </nav>
</template>

<script setup lang="ts">
import TopbarRun from "~/components/topbar/TopbarRun.vue";
import TopbarTools from "~/components/topbar/TopbarTools.vue";
import TopbarAssets from "~/components/topbar/TopbarAssets.vue";
import TopbarWorkspaces from "~/components/topbar/TopbarWorkspaces.vue";
import TopbarSystemButtons from "~/components/topbar/TopbarSystemButtons.vue";
import TopbarModcomp from "~/components/topbar/TopbarModcomp.vue";
import TopbarFind from "~/components/topbar/TopbarFind.vue";
</script>

<style>
.app-region-drag {
    app-region: drag;
}
.app-region-drag-important {
    app-region: drag !important;
}
.app-region-drag * {
    app-region: no-drag;
}
</style>
