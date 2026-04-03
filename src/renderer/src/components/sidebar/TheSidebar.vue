<template>
    <aside class="h-full flex flex-col">
        <div class="grow grid gap-1 content-start p-1 pr-0">
            <SidebarGroup heading="Workspace">
                <SidebarWorkspaces />

                <template #hint>
                    <SidebarAddWorkspaceButton />
                </template>
            </SidebarGroup>

            <SidebarGroup heading="Assets">
                <SidebarCreateAsset />
                <SidebarPotentialAssets />
                <SidebarHotReloadSwitch />
                <SidebarConvertAllAssetsButton />
            </SidebarGroup>

            <SidebarGroup heading="Tools">
                <SidebarBuildFgdButton />
                <SidebarChamberSignConfigButton />
            </SidebarGroup>
        </div>

        <div class="grid gap-1 content-start p-1 pr-0">
            <SidebarGroup heading="Launchers">
                <UButton
                    v-for="option of Shared.Launchers.SharedLauncherOptions"
                    :key="option.name"
                    size="sm"
                    variant="ghost"
                    color="neutral"
                    :label="option.name"
                    @click="() => launch(option)"
                >
                    <template #leading>
                        <MBitmapIcon :name="AppDesign.BitmapIcon.Launchers[option.type]" class="w-4 h-4" />
                    </template>
                </UButton>

                <UButton
                    size="sm"
                    variant="ghost"
                    color="neutral"
                    label="Quit"
                    :icon="AppDesign.Icons.Close"
                    @click="() => quit()"
                />
            </SidebarGroup>
        </div>
    </aside>
</template>

<script setup lang="ts">
import MBitmapIcon from "../common/MBitmapIcon.vue";
import SidebarHotReloadSwitch from "~/components/sidebar/SidebarHotReloadSwitch.vue";
import SidebarAddWorkspaceButton from "~/components/sidebar/SidebarAddWorkspaceButton.vue";
import SidebarCreateAsset from "~/components/sidebar/SidebarCreateAsset.vue";
import { AppDesign } from "~/design/AppDesign.js";
import SidebarBuildFgdButton from "~/components/sidebar/SidebarBuildFgdButton.vue";
import SidebarPotentialAssets from "~/components/sidebar/SidebarPotentialAssets.vue";
import SidebarConvertAllAssetsButton from "~/components/sidebar/SidebarConvertAllAssetsButton.vue";
import SidebarChamberSignConfigButton from "~/components/sidebar/SidebarChamberSignConfigButton.vue";
import * as Shared from "mod_companion_shared";

function quit() {
    window.electronAPI.app.exit();
}

function launch(option: Shared.Launchers.SharedLauncherOption) {
    window.electronAPI.app.launch(option.type, option.args);
}
</script>

<style scoped></style>
