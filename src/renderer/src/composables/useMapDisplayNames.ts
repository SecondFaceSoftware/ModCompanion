import * as pathe from "pathe";
import * as Shared from "mod_companion_shared";

// The intent is to not show the map's folder "prefix" if all maps share are in the same folder.
// Only show it when they're in different folders
export function useMapDisplayNames(mapPathList: Shared.Paths.Path[]): Map<Shared.Paths.Path, string> {
    let prefix: string | undefined = undefined;
    let addPrefix = false;

    for (const p of mapPathList) {
        const dirName = pathe.dirname(p.path);
        if (prefix === undefined) {
            prefix = dirName;
        } else if (prefix !== dirName) {
            addPrefix = true;
            break;
        }
    }

    const map = new Map<Shared.Paths.Path, string>();
    for (const p of mapPathList) {
        const fileName = Shared.Paths.getFileName(p) ?? "";
        if (addPrefix) {
            const dirName = pathe.dirname(p.path);
            map.set(p, pathe.join(dirName, fileName));
        } else {
            map.set(p, fileName);
        }
    }

    return map;
}
