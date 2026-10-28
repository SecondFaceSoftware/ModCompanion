<template>
    <div
        class="grid content-start w-full h-full overflow-x-auto"
        :class="noHeader ? 'grid-rows-[minmax(0,1fr)]' : 'grid-rows-[auto_minmax(0,1fr)]'"
        :style="`grid-template-columns: ${columnTemplate}`"
        @click="handleClickEmptyArea"
        @keydown="handleKeyDown"
    >
        <MDataTableHeader v-if="!noHeader" :columns="columns" />
        <MRecycler :items="entriesHierarchy" :row-height="rowHeight" subgrid key-field="id">
            <template #default="{ item, idx }">
                <MDataTableRow
                    :idx="idx"
                    :entry="item.entry"
                    :columns="props.columns"
                    :draggable="draggable"
                    :depth="item.depth"
                    @drag-start="(e) => handleDragEvent(e, idx, 'onDragStart')"
                    @drag-end="(e) => handleDragEvent(e, idx, 'onDragEnd')"
                />
            </template>
        </MRecycler>
    </div>
</template>

<script setup lang="ts" generic="T">
import {
    DataTableColumn,
    DataTableEntryActionInjectKey,
    DataTableHierarchyEntry,
    DataTableSelectionInjectKey,
} from "~/components/common/dataTable/MDataTable.model.js";
import MDataTableHeader from "~/components/common/dataTable/MDataTableHeader.vue";

const props = defineProps<{
    entries: T[];
    columns: DataTableColumn<T>[];
    rowHeight: number;
    noHeader?: boolean;
    draggable?: boolean;
    treeChildFunc?: (entry: T) => T[] | undefined;
}>();

const entriesHierarchy = computed(() => {
    const func = props.treeChildFunc;
    if (func === undefined) {
        return props.entries.map<DataTableHierarchyEntry<T>>((e, i) => ({ entry: e, depth: 0, id: i }));
    }

    const result: DataTableHierarchyEntry<T>[] = [];

    let i = 0;
    function populateResult(entries: T[], depth: number = 0): void {
        for (const entry of entries) {
            result.push({
                entry,
                depth,
                id: i++,
            });
            const children = func?.(entry);
            if (children) {
                populateResult(children, depth + 1);
            }
        }
    }

    populateResult(props.entries);

    return result;
});

watch(entriesHierarchy, () => {
    deselect();
});

const emit = defineEmits<{
    onEntryActivated: [entry: T, event: MouseEvent | KeyboardEvent];
    onEntryContextMenu: [entry: T];
    onActiveChanged: [entry: T | undefined];
    onSelectionChanged: [entries: T[]];
    onDragStart: [event: DragEvent, primaryEntry: T, allEntries: T[]];
    onDragEnd: [event: DragEvent, primaryEntry: T, allEntries: T[]];
    onKeyDown: [event: KeyboardEvent, active: T | undefined];
}>();

const columnTemplate = computed(() => props.columns.map((c) => c.size ?? "auto").join(" "));

const activeIdx = ref<number | undefined>();
const selectedIdx = ref<number[]>([]);
const selectStartIdx = ref<number | undefined>();

watch(activeIdx, (newIdx) =>
    emit("onActiveChanged", newIdx !== undefined ? entriesHierarchy.value[newIdx].entry : undefined),
);
watch(selectedIdx, (newIdxs) =>
    emit(
        "onSelectionChanged",
        newIdxs.map((i) => entriesHierarchy.value[i].entry),
    ),
);

provide(DataTableSelectionInjectKey, {
    activeIdx,
    selectedIdx,
    selectStartIdx,
    deselect,
    selectAll,
    startSelect,
    endSelect,
    toggleSelect,
    navigate,
});

provide(DataTableEntryActionInjectKey, {
    onEntryActivated: (idx: number, event: MouseEvent | KeyboardEvent) =>
        emit("onEntryActivated", entriesHierarchy.value[idx].entry, event),
    onEntryContextMenu: (event: MouseEvent, idx: number) => {
        // Make the right-clicked item active
        activeIdx.value = idx;
        const activeItemWasAlreadySelected = selectedIdx.value.includes(idx);
        if (event.ctrlKey) {
            selectedIdx.value = [...selectedIdx.value, idx].sort();
        } else if (!activeItemWasAlreadySelected) {
            selectedIdx.value = [idx].sort();
        }

        emit("onEntryContextMenu", entriesHierarchy.value[idx].entry);
    },
});

defineExpose({
    focus: () => {
        // TODO Add back data table focusing
        // const el = gridEl?.value;
        // if (!el) return;
        // const child = el.firstElementChild;
        // if (!child) return;
        // (child as any).focus?.();
    },
    selectAll,
    deselect,
    select,
    activate,
    deactivate,
});

function deselect(): void {
    selectedIdx.value = [];
    selectStartIdx.value = undefined;
    activeIdx.value = undefined;
}

function deactivate(): void {
    activeIdx.value = undefined;
}

function startSelect(startIdx: number): void {
    if (startIdx < 0) return;
    if (startIdx > entriesHierarchy.value.length - 1) return;

    selectedIdx.value = [startIdx];
    activeIdx.value = startIdx;
    selectStartIdx.value = startIdx;
}

function endSelect(endIdx: number): void {
    if (endIdx < 0) return;
    if (endIdx > entriesHierarchy.value.length - 1) return;
    if (activeIdx.value === undefined || selectStartIdx.value === undefined) {
        startSelect(endIdx);
        return;
    }
    const entries = entriesHierarchy.value;
    if (entries === undefined) return;
    const startIdx = selectStartIdx.value;

    if (entries.length < endIdx) return;
    if (entries.length < activeIdx.value) return;
    if (entries.length < startIdx) return;

    const start = startIdx < endIdx ? startIdx : endIdx;
    const end = startIdx > endIdx ? startIdx : endIdx;

    const selectedIdxs: number[] = [];
    for (let i = start; i <= end; i++) {
        selectedIdxs.push(i);
    }

    selectedIdx.value = selectedIdxs;
    activeIdx.value = endIdx;
}

function select(selectFunc: (entry: T) => boolean): void {
    const selection: number[] = [];
    for (let i = 0; i < entriesHierarchy.value.length; i++) {
        const entry = entriesHierarchy.value[i];
        if (selectFunc(entry.entry)) {
            selection.push(i);
        }
    }

    selectedIdx.value = selection;
}

function activate(activeFunc: (entry: T) => boolean): void {
    for (let i = 0; i < entriesHierarchy.value.length; i++) {
        const entry = entriesHierarchy.value[i];
        if (activeFunc(entry.entry)) {
            activeIdx.value = i;
            selectedIdx.value = [i];
            return;
        }
    }
}

function toggleSelect(idx: number): void {
    const foundIdx = selectedIdx.value.findIndex((p) => p === idx);

    const selPathsCopy = [...selectedIdx.value];
    if (foundIdx > -1) {
        selPathsCopy.splice(foundIdx, 1);
    } else {
        selPathsCopy.push(idx);
        activeIdx.value = idx;
    }

    selectedIdx.value = selPathsCopy;
}

function selectAll(): void {
    // Select bottom to top so the top item is the active one
    startSelect(entriesHierarchy.value.length - 1);
    endSelect(0);
}

function navigate(up: boolean, shiftHeld: boolean): void {
    const active = activeIdx.value;
    if (active === undefined) {
        startSelect(0);
        return;
    }

    if (shiftHeld) {
        endSelect(active + (up ? -1 : 1));
    } else {
        startSelect(active + (up ? -1 : 1));
    }
}

// Shortcuts

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "a" && event.ctrlKey) {
        selectAll();
        event.stopPropagation();
        event.preventDefault();
        return;
    }

    const entry = activeIdx.value !== undefined ? entriesHierarchy.value[activeIdx.value].entry : undefined;
    emit("onKeyDown", event, entry);
}

// Dragan drop

function handleDragEvent(event: DragEvent, idx: number, emitEvent: "onDragStart" | "onDragEnd"): void {
    const selection = selectedIdx.value;
    const primarySelected = entriesHierarchy.value[idx].entry;
    if (selection.includes(idx)) {
        const entries = entriesHierarchy.value.filter((value, index) => selection.includes(index)).map((e) => e.entry);
        const orderedEntries = new Set([primarySelected, ...entries]);
        // @ts-expect-error No idea why this errors. The typings are really weird and complicated here. But it seems isolated to this function so no bad types leak out
        emit(emitEvent, event, primarySelected, Array.from(orderedEntries));
    } else {
        // @ts-expect-error No idea why this errors
        emit(emitEvent, event, primarySelected, [primarySelected]);
    }
}

// ----

function handleClickEmptyArea(): void {
    deselect();
}
</script>

<style scoped></style>
