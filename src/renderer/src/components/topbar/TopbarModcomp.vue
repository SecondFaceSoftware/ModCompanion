<template>
    <UDropdownMenu
        :items="itemsMain"
        size="sm"
        :ui="{ content: 'min-w-50' }"
        :content="{
            align: 'start',
        }"
    >
        <UButton size="sm" variant="ghost" class="py-0 px-1">
            <template #default>
                <MBitmapIcon name="uty_48x48" class="h-7 w-7" />
            </template>
        </UButton>

        <template #legend>
            <div class="select-none text-muted tabular-nums font-light text-center w-full">
                Made with 💜 v{{ useSystemStore().version }}

                <USeparator class="my-2 mx-auto w-10" />

                <img
                    class="w-40 mx-auto my-2 -scale-x-100"
                    src="/img/art/utylity_noshadow_800x450.png"
                    alt="Uty-Lity Mascot - Artwork created by Tyson Tan"
                />

                <div>Uty-Lity Mascot</div>
                <div>Created by Tyson Tan</div>
            </div>
        </template>
    </UDropdownMenu>
</template>

<script setup lang="ts">
import { DropdownMenuItem } from "@nuxt/ui/components/DropdownMenu.vue.js";
import { AppDesign } from "~/design/AppDesign.js";
import { useSystemStore } from "~/store/SystemStore.js";

const itemsMain = ref<DropdownMenuItem[][]>([
    [
        {
            label: "Source Code",
            icon: AppDesign.Icons.LinkExternal,
            onSelect(e) {
                window.electronAPI.app.openExternal("https://github.com/SecondFaceSoftware/ModCompanion");
            },
        },
        {
            type: "separator" as const,
        },
        {
            label: "Quit",
            icon: AppDesign.Icons.Close,
            onSelect(e) {
                window.electronAPI.app.exitForReal();
            },
        },
        {
            type: "separator" as const,
        },
        {
            type: "label" as const,
            slot: "legend",
        },
    ],
]);
</script>

<style scoped></style>
