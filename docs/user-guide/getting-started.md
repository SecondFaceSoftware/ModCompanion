# Getting Started

Head to the [releases](https://github.com/SecondFaceSoftware/ModCompanion/releases) page on GitHub an download the latest release

## Project setup

Mod Companion integrates into your entire project setup, so it expects a certain folder structure and workflow. 
If you require a different folder structure and Mod Companion doesn't seem to work with it, 
feel free to open an issue or contact us on Discord, but in general, Mod Companion comes with certain expectations and 
we don't plan to adapt it to fit every project and workflow under the sun. The purpose of Mod Companion is to establish a workflow.

### Folder structure

Our Portal: Revolution 2 development repository uses this folder structure.

This is what your development repository should look like. The content/game structure is based on what Valve
used. It's also embedded into some Source Engine tools like Color Correction Editor. If you're still working
with a Sourcemod-based, now's the time to upgrade.

```
<root>
  - game
    - bin
      - linux64
      - win64                       <- revolution.exe, hammer.exe, hlmv.exe, faceposer.exe in here
    - revolution                    <- Default search path. You should know what goes here
      - maps
      - materials
      - models
      ...
  - content
    - revolution
      - _modcomp_asset_groups       <- Mod Companion puts some json files in here to group assets
      - fgd_builder                 <- TeamSpen's FGD unifier tool lives here. Optional
      - maps                        <- Map sources
      - materialsrc                 <- Material sources. .png files and such. 
                                       Mod Companion will put .mca files here
      - models                      <- Model sources. .smd .qc .dmx .fbx files and such
                                       Mod Companion will put .mca files here
      - panorama                    <- Panorama sources that use our tsxml setup. Optional
      ...
  - tools                           <- We also put a bunch of other tools like teamcity scripts here
    - mod_companion                 <- Extract the app here so the directory paths line up
      - app                         <- Contains the JavaScript bundles that make the app what it is
      - electron_runtime_linux64    <- Contains mod_companion executable and the electron runtime
      - electron_runtime_win64      <- Contains mod_companion.exe and the electron runtime
      - appconfig.json              <- Mod Companion config
```

### Add mod companion

Prepare your `tools/mod_companion` directory and extract the zip you downloaded here. Make sure the directory paths match the graphic above

### Create the config

In `tools/mod_companion` create files `appconfig.json` and `projectconfig.json`

appconfig.json
```json
{
    "project": "./projectconfig.json"
}
```

Make sure to remove the comments!

projectconfig.json
```json5
{
    // Path to the root directory of your project.
    // The directory that contains game and content dirs. 
    // Resolves relative to this projectconfig.json
    "root": "../../",
    
    // Your steam app id. Use another game's if you don't have one (Like 620 for Portal 2). Currently unused
    "steamAppId": 0,
  
    // Your game's primary searchpath. Mod Companion currently only supports a single search path. This is the name of the folder that contains your gameinfo.txt
    "searchPath": "revolution",
  
    // The name of your game exe. portal2.exe, hl2.exe... BUT without the exe extension! 
    "launcherName": "revolution",
    
    // Optional. If you want to use an artifact cloud, this is the config layout
    "artifactCloud": {
        "s3": {
            "clientConfig": {
                "credentials": {
                    "accessKeyId": "",
                    "secretAccessKey": ""
                },
              "region": "",
              "endpoint": ""
            },
            "bucket": "", 
            // only search for map files in directories with this prefix
            "mapsPrefix": ""
        }
    },
    
    // optional.
    "assetDefaults": {
      
        // Recommended default config for strata source games
        "vtfOptions": { 
            "version": "7.6",
            "format": "BC7",
            "compressionMethod": "DEFLATE",
            "filter": "KAISER"
        }
    }
}

```

### To .gitignore or not to .gitignore

(Applies to other version control systems of course)

- The whole `mod_companion` directory should be checked into git, as well as any updates, so your whole team as access
- `appconfig.json` should be checked in
- `.mca` files and the source files they reference should be checked in
- `_modcomp_asset_groups` should be checked in
- `.vtf .mdl .phy...` files in the game directory should be IGNORED! Mod Companion will build these on demand, saving you LFS usage (On Portal: Revolution 2, we only gitignore those files in an `_hr` subdirectory, we still check in Portal 2 assets that we don't have sources for)
- `.bsp` files should be IGNORED
