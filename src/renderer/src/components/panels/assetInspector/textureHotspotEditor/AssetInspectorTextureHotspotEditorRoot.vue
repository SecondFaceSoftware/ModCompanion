<template>
    <MPanelRoot always-show-scroll class="@container">
        <div class="grid grid-cols-1 @3xl:grid-cols-[3fr_2fr] content-start gap-1">
            <div class="aspect-square">
                <canvas :id="id" ref="canvasRef" width="1000" height="1000" class="h-full w-full" />
            </div>

            <div class="p-1">
                <div class="grid grid-cols-1 gap-2">
                    <UFormField label="Mode">
                        <UButtonGroup>
                            <UButton
                                label="Select"
                                :icon="AppDesign.Icons.ActionSelectCursor"
                                :color="editMode === HotspotEditMode.Select ? 'info' : 'neutral'"
                                @click="setEditMode(HotspotEditMode.Select)"
                            />
                            <UButton
                                label="Draw"
                                :icon="AppDesign.Icons.ActionEditPencil"
                                :color="editMode === HotspotEditMode.Draw ? 'info' : 'neutral'"
                                @click="setEditMode(HotspotEditMode.Draw)"
                            />
                            <UButton
                                label="Delete"
                                :icon="AppDesign.Icons.ActionDelete"
                                :color="editMode === HotspotEditMode.Delete ? 'info' : 'neutral'"
                                @click="setEditMode(HotspotEditMode.Delete)"
                            />
                        </UButtonGroup>
                    </UFormField>
                    <UFormField
                        v-if="editMode === HotspotEditMode.Select && selectedRectIdx !== undefined"
                        label="Selected Rect"
                    >
                        <AssetInspectorTextureHotspotEditorFlags :flags="selectedRectFlags" @changed="handleChanged" />
                    </UFormField>
                    <UFormField label="Grid">
                        <div class="grid gap-4">
                            <UButtonGroup>
                                <UButton
                                    label="8"
                                    :color="gridSnapSize === 8 ? 'info' : 'neutral'"
                                    @click="setGridSnapSize(8)"
                                />
                                <UButton
                                    label="16"
                                    :color="gridSnapSize === 16 ? 'info' : 'neutral'"
                                    @click="setGridSnapSize(16)"
                                />
                                <UButton
                                    label="32"
                                    :color="gridSnapSize === 32 ? 'info' : 'neutral'"
                                    @click="setGridSnapSize(32)"
                                />
                                <UButton
                                    label="64"
                                    :color="gridSnapSize === 64 ? 'info' : 'neutral'"
                                    @click="setGridSnapSize(64)"
                                />
                                <UButton
                                    label="128"
                                    :color="gridSnapSize === 128 ? 'info' : 'neutral'"
                                    @click="setGridSnapSize(128)"
                                />
                                <UButton
                                    label="256"
                                    :color="gridSnapSize === 256 ? 'info' : 'neutral'"
                                    @click="setGridSnapSize(256)"
                                />
                            </UButtonGroup>

                            <UCheckbox :id="useId()" v-model="gridShow" label="Show Snap Grid" />
                            <UCheckbox :id="useId()" v-model="showRectTiles" label="Show Rect Tiles" />
                            <UCheckbox :id="useId()" v-model="showIds" label="Show IDs" />
                        </div>
                    </UFormField>
                </div>
            </div>
        </div>
    </MPanelRoot>
</template>
<script setup lang="ts">
import createHotspotEditor, { HotspotEditMode, HotspotEditor } from "~/canvas/hotspotEditor/HotspotEditor.js";
import { useElementSize, useMouseInElement, useMousePressed } from "@vueuse/core";
import { Logger } from "~/logger.js";
import { AppDesign } from "~/design/AppDesign.js";
import { useRememberRef } from "~/composables/useRemember.js";
import { useAssetListStore } from "~/store/AssetListStore.js";
import * as Shared from "mod_companion_shared";

const id = useId();

const canvasRef = useTemplateRef("canvasRef");

const props = defineProps<{ meta: Shared.ImageMeta.ImageMetaReport; asset: Shared.Asset.TextureAsset }>();

const { width, height } = useElementSize(canvasRef);
const editMode = useRememberRef(ref(HotspotEditMode.Select), "hotspot-editor-mode");
const showIds = useRememberRef(ref(false), "hotspot-editor-show-ids");
const showRectTiles = useRememberRef(ref(false), "hotspot-editor-show-rect-tiles");
const gridSnapSize = useRememberRef(ref(16), "hotspot-editor-snap-size");
const gridShow = useRememberRef(ref(false), "hotspot-editor-snap-show");

const selectedRectIdx = ref<number | undefined>(undefined);
const selectedRectFlags = ref<Shared.Vtf.SharedVtfHotspotRectFlags | undefined>(undefined);

function handleChanged(flags: Shared.Vtf.SharedVtfHotspotRectFlags) {
    if (selectedRectIdx.value) {
        editor.value?.updateRectFlags(selectedRectIdx.value, toRaw(flags));
    }
}

function setGridSnapSize(size: number) {
    gridSnapSize.value = size;
}

function setEditMode(mode: HotspotEditMode) {
    editMode.value = mode;
}

// TODO: Feed this from main process
const scalingFactor = 2;
const assetStore = useAssetListStore();

const editor = ref<HotspotEditor | undefined>(undefined);
onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d")!;
    editor.value = createHotspotEditor(ctx, 1000, 1000);
    editor.value.updateEditMode(editMode.value);
    editor.value.updateShowIds(showIds.value);
    editor.value.updateGridShow(gridShow.value);
    editor.value.updateGridSnap(gridSnapSize.value);
    editor.value.updateRectTiles(showRectTiles.value);

    updateEditorTexture(props.meta, editor.value);

    const { elementX, elementY } = useMouseInElement(canvasRef);
    useMousePressed({
        target: canvasRef,
        onPressed: (event) => {
            if ((event as any).buttons !== undefined) {
                const mouseEvent = event as MouseEvent;
                if (mouseEvent.buttons === 1) {
                    editor.value?.updateMouse1Pressed(true);
                } else if (mouseEvent.buttons === 2) {
                    editor.value?.updateMouse2Pressed(true);
                }
            }
        },
        onReleased: () => {
            editor.value?.updateMouse1Pressed(false);
            editor.value?.updateMouse2Pressed(false);
        },
    });
    watch(elementX, (x) => editor.value?.updateMouseX(x * scalingFactor));
    watch(elementY, (y) => editor.value?.updateMouseY(y * scalingFactor));
    watch(width, (w) => {
        if (canvasRef.value) {
            canvasRef.value.width = w * scalingFactor;
        }
        editor.value?.updateRealWidth(w * scalingFactor);
    });
    watch(height, (h) => {
        if (canvasRef.value) {
            canvasRef.value.height = h * scalingFactor;
        }
        editor.value?.updateRealHeight(h * scalingFactor);
    });

    watch(
        () => props.meta,
        (m) => {
            updateEditorTexture(m, editor.value!);
        },
    );

    watch(
        () => props.asset,
        (asset) => {
            if (asset.def.vtfOptions?.hotspot) {
                editor.value?.updateRects(toRaw(asset.def.vtfOptions.hotspot));
            } else {
                editor.value?.updateRects([]);
            }
        },
    );
    if (props.asset.def.vtfOptions?.hotspot) {
        editor.value.updateRects(toRaw(props.asset.def.vtfOptions.hotspot));
    }

    watch(gridSnapSize, editor.value.updateGridSnap);
    watch(gridShow, editor.value.updateGridShow);
    watch(editMode, editor.value.updateEditMode);
    watch(showIds, editor.value.updateShowIds);
    watch(showRectTiles, editor.value.updateRectTiles);

    editor.value.changedEvent.on((r) => {
        const options: Shared.Vtf.SharedVtfCreateOptions = { ...toRaw(props.asset.def.vtfOptions), hotspot: r };

        const asset: Shared.Asset.TextureAsset = {
            ...toRaw(props.asset),
            def: { ...toRaw(props.asset.def), vtfOptions: options },
        };
        assetStore.writeAssets([asset]);
    });

    editor.value.selectedEvent.on((rectAndIdx) => {
        selectedRectIdx.value = toRaw(rectAndIdx?.idx);
        selectedRectFlags.value = structuredClone(toRaw(rectAndIdx?.rect.flags));
    });
});

function updateEditorTexture(meta: Shared.ImageMeta.ImageMetaReport, editor: HotspotEditor) {
    if (meta.filePath && meta.tags) {
        const w = meta.tags["Image Width"]?.value;
        const h = meta.tags["Image Height"]?.value;
        if (w && h) {
            const wNum = typeof w === "number" ? w : Number.parseInt(w);
            const hNum = typeof h === "number" ? h : Number.parseInt(h);
            editor.updateTexture(`file://${meta.filePath}`, wNum, hNum);
        }
    } else {
        Logger.warning(
            Shared.Log.Channel.Hotspot,
            "Updating hotspot editor texture failed. Image's meta is invalid: ",
            meta,
        );
    }
}
</script>

<style scoped></style>
