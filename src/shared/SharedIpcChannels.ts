export const Channels = {
    AppLaunch: "app_launch",
    AppExitForReal: "app_exit_for_real",
    AppCloseWindow: "app_close_window",
    AppMinimize: "app_minimize",
    AppMaximize: "app_maximize",
    AppUnmaximize: "app_unmaximize",
    AppToggleMaximized: "app_toggle_maximized",
    AppOpenExternal: "app_open_external",
    AppVersion: "app_version",
    AppRendererReady: "app_renderer_ready",

    ClipboardWriteText: "clipboard_write_text",

    FileBrowser_ListFilesQuery: "filebrowser_list_files",
    FileBrowser_FileEntryQuery: "filebrowser_file_entry",
    FileBrowser_ExecuteAction: "filebrowser_execute",
    FileBrowser_BrowseToFileAction: "filebrowser_browse_to",
    FileBrowser_UpdateOpenedDirsAction: "filebrowser_update_opened_dirs",
    FileBrowser_OpenAction: "filebrowser_open",
    FileBrowser_DirUpdatedEvent: "filebrowser_update_dir",
    FileBrowser_IndexUpdatedEvent: "filebrowser_update_index",

    FileReadString: "file_read_string",
    FileWriteString: "file_write_string",
    FileDelete: "file_delete",
    FileExists: "file_exists",

    ConfigGet: "config_get",

    MapListSourceDirs: "map_list_source_dirs",
    MapQueueEnqueue: "map_queue_enqueue",
    MapQueueUpdated: "map_queue_updated",
    MapQueueSetPaused: "map_queue_set_paused",
    MapQueueCancel: "map_queue_cancel",
    MapCompileLog: "map_compile_log",
    MapCompileProgress: "map_compile_progress",
    MapCreateTimeReport: "map_create_time_report",

    AssetRescanned: "asset_rescanned",
    AssetAdded: "asset_added",
    AssetUpdated: "asset_updated",
    AssetForceRescan: "asset_force_rescan",
    AssetNavigateToId: "asset_navigate_to_id",
    AssetScanProgressEvent: "asset_scan_progress",
    AssetCreate: "asset_create",
    AssetCreateEmpty: "asset_create_empty",
    AssetUpdate: "asset_update",
    AssetDelete: "asset_delete",

    ImageGetMeta: "image_get_meta",

    ConversionEnqueue: "conversion_enqueue",
    ConversionEnqueueAll: "conversion_enqueue_all",
    ConversionAgentStart: "conversion_agent_start",
    ConversionAgentStop: "conversion_agent_stop",
    ConversionUpdated: "conversion_updated",
    ConversionGetState: "conversion_get_state",
    ConversionClearEvents: "conversion_clear_events",

    HotReloadSetEnabled: "hotreload_set_enabled",
    HotReloadTriggered: "hotreload_triggered",

    InteropSendCommand: "interop_send_command",
    InteropConnected: "interop_connected",
    InteropDisconnected: "interop_disconnected",
    InteropLog: "interop_log",

    AssetGroupsRescanned: "assetgroup_rescanned",
    AssetGroupsForceRescan: "assetgroup_force_rescan",
    AssetGroupsCreate: "assetgroup_create",
    AssetGroupsUpdate: "assetgroup_update",
    AssetGroupsDelete: "assetgroup_delete",

    FgdBuild: "fgd_build",

    ArtifactCloud_IsConnected: "artifacts_cloud_is_connected",
    ArtifactCloud_ListAllMaps: "artifacts_cloud_list_all_maps",
    ArtifactCloud_DownloadMap: "artifacts_cloud_download_map",

    MdlInfoGet: "mdlinfo_get",

    VtfInfoQuery: "vtf_info_query",
    VtfExtractQuery: "vtf_extract_query",

    LogSendFromRenderer: "log_send_from_renderer",
    LogSendFromMain: "log_send_from_main",

    TaskStart: "task_start",
    TaskUpdate: "task_update",
    TaskEnd: "task_end",
} as const;
export type Channel = (typeof Channels)[keyof typeof Channels];
