import { computed, Ref } from "vue";
import * as Shared from "mod_companion_shared";

export function useFilter<T>(
    items: Ref<T[]>,
    accessorFunc: (item: T) => string,
    filter: Ref<string>,
): ComputedRef<T[]> {
    return computed(() => {
        if (filter.value === "") {
            return items.value;
        }

        const filteredItems: T[] = [];
        for (const item of items.value) {
            const accessor = accessorFunc(item);
            const splits = filter.value.split(" ");

            let match = true;
            for (const split of splits) {
                if (split === "") continue;

                if (!accessor.toLowerCase().includes(split)) {
                    match = false;
                }
            }

            if (match) {
                filteredItems.push(item);
            }
        }

        return filteredItems;
    });
}

export function useAssetsFilter(
    assets: Iterable<Shared.Asset.Asset>,
    searchFilter: string | undefined,
    typeFilter: Shared.Asset.Type[] | undefined,
): Shared.Asset.Asset[] {
    if (!searchFilter && (!typeFilter || typeFilter.length === 0)) {
        return Array.from(assets);
    }

    const filteredAssets: Shared.Asset.Asset[] = [];
    for (const asset of assets) {
        if (typeFilter && typeFilter.length > 0) {
            const isIncluded = typeFilter.includes(asset.def.type);
            if (!isIncluded) continue;
        }

        if (searchFilter) {
            const splits = searchFilter.split(" ");

            let match = true;
            for (const split of splits) {
                if (split === "") continue;

                if (!asset.def.displayName?.toLowerCase()?.includes(split)) {
                    match = false;
                }
            }

            if (match) {
                filteredAssets.push(asset);
            }
        } else {
            filteredAssets.push(asset);
        }
    }

    filteredAssets.sort((a, b) => {
        if (a.def.displayName !== undefined && b.def.displayName !== undefined) {
            return a.def.displayName.localeCompare(b.def.displayName);
        }

        if (a.defFilePath !== undefined && b.defFilePath !== undefined) {
            return a.defFilePath.localeCompare(b.defFilePath);
        }

        return a.def.id.localeCompare(b.def.id);
    });

    return filteredAssets;
}

export function useFileFilter(
    files: Map<string, Shared.FileBrowser.FileEntries>,
    searchFilter: string | undefined,
    maxResults: number,
): Shared.FileBrowser.FileEntries {
    if (!searchFilter) {
        const entries = Array.from(files.values().map((f) => f.entries)).flat();
        return { valid: true, entries };
    }

    const result: Shared.FileBrowser.FileEntry[] = [];

    let resultsCount = 0;

    const searchTerms = searchFilter.split(" ");
    loop1: for (const [key, entry] of files.entries()) {
        for (const e of entry.entries) {
            let match = true;
            for (const term of searchTerms) {
                if (!e.name.includes(term)) {
                    match = false;
                }
            }

            if (match) {
                if (resultsCount++ > maxResults) break loop1;
                result.push(e);
            }
        }
    }

    return { valid: true, entries: result };
}
