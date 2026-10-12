<template>
    <div class="grid gap-2 content-start">
        <UFormField label="General">
            <MVerticalTable tabular-nums :items="generalItems" />
        </UFormField>
        <UFormField v-if="materialsItems" label="Materials">
            <MVerticalTable tabular-nums :items="materialsItems" />
        </UFormField>
        <UFormField v-if="cdMaterialsItems" label="CD Materials">
            <MVerticalTable tabular-nums :items="cdMaterialsItems" />
        </UFormField>
    </div>
</template>

<script setup lang="ts">
import { VerticalTableItem } from "~/components/common/MVerticalTable.model.js";
import MVerticalTable from "~/components/common/MVerticalTable.vue";
import * as Shared from "mod_companion_shared";

const props = defineProps<{ path: Shared.Paths.Path }>();

const info = ref<Shared.MdlInfo.SharedMdlInfoReport | undefined>();

watch(
    () => props.path,
    (val) => window.electronAPI.mdl.info(val).then((r) => (info.value = r)),
);

window.electronAPI.mdl.info(props.path).then((r) => (info.value = r));

const generalItems = computed<VerticalTableItem[]>(() => {
    return [
        { name: "Name", value: info.value?.general.name ?? "" },
        { name: "ID", value: info.value?.general.id ?? "" },
        { name: "Version", value: info.value?.general.version ?? "" },
        { name: "Checksum", value: info.value?.general.checksum ?? "" },
        { name: "Eye Pos", value: info.value?.general.eye_pos ?? "" },
        { name: "Illum Pos", value: info.value?.general.illum_pos ?? "" },
        { name: "Hull Min", value: info.value?.general.hull_min ?? "" },
        { name: "Hull Max", value: info.value?.general.hull_max ?? "" },
        { name: "Bone Count", value: info.value?.general.bone_count ?? "" },
        { name: "Attachments", value: info.value?.general.attachment_count ?? "" },
        { name: "Surfaceprop", value: info.value?.general.surfaceprop ?? "" },
    ];
});

const materialsItems = computed<VerticalTableItem[] | undefined>(() => {
    return info.value?.materials?.map<VerticalTableItem>((value, i) => ({ name: i.toString(), value })) ?? undefined;
});
const cdMaterialsItems = computed<VerticalTableItem[] | undefined>(() => {
    return info.value?.cdmaterials?.map<VerticalTableItem>((value, i) => ({ name: i.toString(), value })) ?? undefined;
});
</script>

<style scoped></style>
