import { Reactive, Ref, watch } from "vue";
import { watchDeep } from "@vueuse/core";
import { useWorkspaceStore } from "~/store/WorkspaceStore.js";

export function useRememberRef<T>(ref: Ref<T>, keyName: string) {
    watch(ref, (r) => localStorage.setItem(keyName, JSON.stringify(r)));

    const val = localStorage.getItem(keyName);
    if (!val) return ref;

    ref.value = JSON.parse(val);
    return ref;
}

export function useRememberWorkspaceRef<T>(ref: Ref<T>, keyName: string) {
    const workspaceStore = useWorkspaceStore();

    watch(
        () => workspaceStore.activeWorkspace,
        (w) => {
            const val = localStorage.getItem(`${keyName}+${w}`);
            if (val !== null) {
                ref.value = JSON.parse(val);
            }
        },
    );
    watch(ref, () => {
        localStorage.setItem(`${keyName}+${workspaceStore.activeWorkspace}`, JSON.stringify(ref.value));
    });

    const val = localStorage.getItem(`${keyName}+${workspaceStore.activeWorkspace}`);
    if (val === null) return ref;

    ref.value = JSON.parse(val);
    return ref;
}

export function useRememberWorkspaceReactiveMap<V extends object>(map: Reactive<Map<string, V>>, keyName: string) {
    const workspaceStore = useWorkspaceStore();

    function updateMap(parsed: any) {
        map.clear();
        for (const [k, v] of Object.entries(parsed)) {
            // @ts-expect-error i don't know what the fucking types are doing here man
            map.set(k, v);
        }
    }

    watch(
        () => workspaceStore.activeWorkspace,
        (w) => {
            const val = localStorage.getItem(`${keyName}+${w}`);
            if (val === null) {
                return;
            }

            const parsed = JSON.parse(val);
            updateMap(parsed);
        },
    );
    watch(
        () => map,
        () => {
            const rawMap = toRaw(map) as Map<string, V>;
            const obj: Record<string, V> = {};
            for (const [k, v] of rawMap.entries()) {
                obj[k] = v;
            }

            const data = JSON.stringify(obj);
            localStorage.setItem(`${keyName}+${workspaceStore.activeWorkspace}`, data);
        },
        { deep: true },
    );

    const val = localStorage.getItem(`${keyName}+${workspaceStore.activeWorkspace}`);
    if (val === null) return map;

    const parsed = JSON.parse(val);
    updateMap(parsed);

    return map;
}

export function useRememberStringArray<T extends string>(ref: Ref<T[]>, keyName: string): Ref<T[], T[]> {
    return useRememberArray(ref, keyName, (obj) => !obj.some((m) => typeof m !== "string"));
}

export function useRememberArray<T>(
    ref: Ref<T[]>,
    keyName: string,
    validationFunc?: (obj: any[]) => boolean,
): Ref<T[], T[]> {
    watchDeep(ref, (r) => localStorage.setItem(keyName, JSON.stringify(r)));

    const arrStr = localStorage.getItem(keyName);
    if (!arrStr) return ref;

    const arrAny = JSON.parse(arrStr);

    if (!Array.isArray(arrAny)) {
        console.warn(`Loading ${keyName} from local storage failed: Value is not array`);
        return ref;
    }

    if (validationFunc && !validationFunc?.(arrAny)) {
        console.warn(`Loading ${keyName} from local storage failed: Object validation failed`);
        return ref;
    }
    ref.value = arrAny as T[];
    return ref;
}
