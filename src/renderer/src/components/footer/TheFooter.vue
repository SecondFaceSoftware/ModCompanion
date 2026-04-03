<template>
    <MPaper class="grid grid-cols-subgrid col-span-full gap-1">
        <FooterModcompButton />
        <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <div>
                <USeparator orientation="vertical" />
                <FooterLog />
            </div>
            <div class="flex items-center gap-2">
                <USeparator orientation="vertical" />
                <FooterTcArtifactsStatus />
                <USeparator orientation="vertical" />
                <FooterConversionStatus />
                <USeparator orientation="vertical" />
                <FooterInteropStatus />
            </div>
        </div>
    </MPaper>
</template>

<script setup lang="ts">
import FooterConversionStatus from "~/components/footer/FooterConversionStatus.vue";
import FooterLog from "~/components/footer/FooterLog.vue";
import FooterModcompButton from "~/components/footer/FooterModcompButton.vue";
</script>

<style scoped></style>
