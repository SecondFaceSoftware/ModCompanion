import * as Shared from "mod_companion_shared";

export function openMca(asset: Shared.Asset.Asset): void {
    const p = asset.defFilePath;
    if (!p) return;
    window.electronAPI.fileBrowser.open(Shared.Paths.createPath(p, Shared.Paths.PathBases.Root));
}

export function exploreToDefinition(asset: Shared.Asset.Asset): void {
    const p = asset.defFilePath;
    if (!p) return;
    window.electronAPI.fileBrowser.browseTo(Shared.Paths.createPath(p, Shared.Paths.PathBases.Root));
}

export function openAssociatedFile(associatedFile: string): void {
    window.electronAPI.fileBrowser.open(Shared.Paths.createPath(associatedFile, Shared.Paths.PathBases.Root));
}
