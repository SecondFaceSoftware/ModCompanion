<template>
    <div class="flex gap-1 overflow-x-hidden justify-end">
        <UFieldGroup>
            <UButton
                size="sm"
                :variant="gameInteropStore.connected ? 'subtle' : 'outline'"
                :color="gameInteropStore.connected ? 'success' : 'neutral'"
                @click="handleClickGame"
            >
                <MBitmapIcon :name="AppDesign.BitmapIcon.Launchers[Shared.Launchers.Launchers.Game]" />
                <span
                    class="text-nowrap overflow-x-clip text-ellipsis max-md:hidden"
                    :class="gameInteropStore.connected ? 'text-success' : 'text-muted'"
                >
                    {{ Shared.Launchers.GameLauncherOptions[lastRunGameConfig]?.name }}
                </span>
                <UIcon
                    v-if="gameInteropStore.connected"
                    :name="AppDesign.Icons.InteropConnected"
                    class="text-success"
                />
            </UButton>
            <UDropdownMenu
                :items="gameItems"
                :content="{
                    align: 'end',
                }"
            >
                <UButton
                    size="sm"
                    :variant="gameInteropStore.connected ? 'subtle' : 'outline'"
                    :class="gameInteropStore.connected ? 'text-success' : 'text-muted'"
                    :trailing-icon="AppDesign.Icons.ChevronDown"
                    :color="gameInteropStore.connected ? 'success' : 'neutral'"
                />
            </UDropdownMenu>
        </UFieldGroup>

        <UFieldGroup>
            <template v-for="(option, i) in Shared.Launchers.ToolLauncherOptions" :key="i">
                <UTooltip :text="'Start ' + option.name">
                    <UButton variant="outline" size="xs" @click="() => handleClickTool(option)">
                        <MBitmapIcon :name="AppDesign.BitmapIcon.Launchers[option.type]" />
                    </UButton>
                </UTooltip>
            </template>
        </UFieldGroup>
    </div>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import { DropdownMenuItem } from "@nuxt/ui/components/DropdownMenu.vue.js";
import * as Shared from "mod_companion_shared";
import { useRememberRef } from "~/composables/useRemember.js";
import { useGameInteropStore } from "~/store/GameInteropStore.js";

const gameInteropStore = useGameInteropStore();

const lastRunGameConfig = useRememberRef(ref<number>(1), "last-run-game-config-idx");

function handleClickGame(): void {
    const idx = Math.max(0, Math.min(lastRunGameConfig.value, Shared.Launchers.GameLauncherOptions.length - 1));
    const option = Shared.Launchers.GameLauncherOptions[idx];
    window.electronAPI.app.launch(option.type, option.args);
}

function handleClickTool(option: Shared.Launchers.LauncherOption): void {
    window.electronAPI.app.launch(option.type, option.args);
}

const gameItems = ref<DropdownMenuItem[][]>([
    Shared.Launchers.GameLauncherOptions.map(
        (o, idx) =>
            ({
                label: o.name,
                onSelect() {
                    lastRunGameConfig.value = idx;
                    window.electronAPI.app.launch(o.type, o.args);
                },
            }) satisfies DropdownMenuItem,
    ),
]);
</script>

<style scoped></style>
