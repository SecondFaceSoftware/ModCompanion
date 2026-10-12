import { PanelBehavior, PanelModel } from "~/helper/GlobalComponents.js";
import { AppDesign } from "~/design/AppDesign.js";
import * as pathe from "pathe";
import { EventHandler } from "~/composables/useEvent.js";
import { PanelShortcuts } from "~/composables/usePanelShortcuts.js";

export interface FileInspectorModel extends PanelModel {
    /** Root relative. File inspector has no concept of bases. It always stores root relative bases, so no need to use Path here */
    file: string;
}

export interface FileInspectorShortcuts extends PanelShortcuts {
    onSave: EventHandler<void>;
}

export const FileInspectorBehavior = {
    getIcon(model: FileInspectorModel | undefined): string {
        return AppDesign.Icons.Panel_FileInspector;
    },
    getTitle(model: FileInspectorModel | undefined): string {
        if (model) {
            return pathe.basename(model.file);
        } else {
            return "File";
        }
    },
    FileEditorInjectKey: Symbol() as InjectionKey<{
        saveEvent: EventHandler<void>;
    }>,
    ShortcutsInjectKey: Symbol() as InjectionKey<ComputedRef<FileInspectorShortcuts>>,
} satisfies PanelBehavior<FileInspectorModel>;
