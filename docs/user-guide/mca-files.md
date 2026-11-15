# MCA Files

MCA files (short for Mod Companion Asset) are JSON metadata files used to identify assets and provide additional metadata.
They are primarily used for textures.

Other asset types like models and materials can be detected from existing source engine files. 
Mod Companion finds your .qc and .vmt and creates an internal MCA representation in-memory. 

## Format

Example texture:

```json5
{
    // The id can be anything as long as it's unique. Mod Companion automatically generates a UUID like this
    id: "ea5c81f9-1895-4b13-80ef-13e441707c00",
  
    // The asset's type. 
    // Valid are: "texture", "model", "material"
    // However, models and materials are automatically detected so only texture is really used in mca files right now
    type: "texture",
    displayName: "greenest_grass",

    // These are the raw content files that make up the asset. 
    // In case of textures, these paths are sent to maretf to create the vtf
    // Content file paths are "content relative": <project_root>/content/<search_path>
    contentFiles: [ "materialsrc/grass/greenest_grass.png" ],

    // Game file paths are "game relative": <project_root>/game/<search_path>
    gameFiles: [ "materials/grass/greenest_grass.vtf" ],
  
    // Optional. Only exists for textures. Defines the parameters that should be passed to maretf 
    vtfOptions: SharedVtfCreateOptions,
    
    // Optional. Lets you associate this asset with their project source files. Only these programs are valid right now
    // Associated file paths are "project root relative"
    associatedFiles: {
        substanceDesigner: "",
        substancePainter: "",
        blender: "content/revolution/materialsrc/grass/greenest_grass.blend"
    },
  
    // Optional plain text field that lets you keep track of the external author of an asset
    credits: "From polyhaven",
}
```

:::tip
See 
[SharedAsset](https://github.com/SecondFaceSoftware/ModCompanion/blob/de32348462258a24fe5cdfcf3bd1f30f1a2bae3a/src/shared/SharedAsset.ts#L91)
and 
[SharedVtfCreateOptions](https://github.com/SecondFaceSoftware/ModCompanion/blob/de32348462258a24fe5cdfcf3bd1f30f1a2bae3a/src/shared/SharedVtf.ts#L35)
for full definitions.
:::

## Asset detection

On startup, or when pressing the Rescan Assets button, Mod Companion walks your project file tree, looking for .mca, .vmt and .qc files.

.mca files are read as-is and directly represent the internal asset data structure.

.vmt and .qc files are treated as "transient" assets in-memory. Mod Companion keeps track of them like any other .mca asset,
but only in-memory. Features like credits and associated files are not supported for transient assets. 

Mod Companion parses .qc files and automatically adds the references model sources (.dmx .smd .fbx...) as content files 