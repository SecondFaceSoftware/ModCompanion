# Path Bases

Paths come in different forms and are useful depending on the context

| Path Base        | Example                                                     | Uses                                                                                                                          |
|------------------|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Absolute         | D:/Revo2/game/revolution/materials/carpet/office_carpet.vmt | Writing to the file, storing in-memory indexes and caches                                                                     |
| Root Relative    | game/revolution/materials/carpet/office_carpet.vmt          | Default way of representing files and storing file paths on disk                                                              |
| Game Relative    | materials/carpet/office_carpet.vmt                          | Stored in assets. Saves writing game/revolution into assets, making them portable across game namespaces and saves repetition |
| Content Relative | materialsrc/carpet/office_carpet.png                        | Stored in assets. Similar to game relative                                                                                    | 
| Material Path    | carpet/office_carpet.vmt                                    | Used in material contexts                                                                                                     |

The type `Shared.FileBrowser.PathBases` can be used to differentiate between different paths