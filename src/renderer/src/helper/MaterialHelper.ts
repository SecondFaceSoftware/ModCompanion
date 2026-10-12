import { useFileBrowserStore } from "~/store/FileBrowserStore.js";
import { VmtFile } from "mod_companion_shared/SharedVmt.js";
import * as Shared from "mod_companion_shared";

export const MaterialHelper = {
    async createMaterial(vmt: VmtFile) {
        const data = Shared.Vmt.serializeMaterial(vmt);
        return useFileBrowserStore().createFile(
            Shared.Paths.createPath(vmt.filePath, Shared.Paths.PathBases.Root),
            data,
        );
    },
};
