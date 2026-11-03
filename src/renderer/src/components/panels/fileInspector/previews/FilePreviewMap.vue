<template>
    <div>
        <div class="flex gap-1">
            <UButton label="Open in Hammer" @click="handleEdit">
                <template #leading>
                    <MBitmapIcon :name="AppDesign.BitmapIcon.Launchers[Shared.Launchers.Launchers.Hammer]" />
                </template>
            </UButton>
            <UButton label="Play in Game" @click="handlePlay">
                <template #leading>
                    <MBitmapIcon :name="AppDesign.BitmapIcon.Launchers[Shared.Launchers.Launchers.Game]" />
                </template>
            </UButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import * as Shared from "mod_companion_shared";
import { openMapInGame, openMapInHammer } from "~/helper/LauncherHelper.js";
import { getAppConfig } from "~/renderer-config.js";
import * as pathe from "pathe";

const props = defineProps<{ path: Shared.Paths.Path }>();

function handleEdit(): void {
    openMapInHammer(Shared.Paths.getFileName(props.path) ?? "");
}

function handlePlay(): void {
    openMapInGame(props.path.path);
}
</script>

<style scoped></style>
