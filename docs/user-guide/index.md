# What is Mod Companion?

Mod Companion (or Modcomp for short) is a standalone desktop app built to help with creating games and
mods using [Valve's Source Engine](https://developer.valvesoftware.com/wiki/Source).

While Source Engine is proprietary, with only portions of its source code being publicly available, 
Mod Companion's code is fully open source and available for modification. 

This is achieved by not integrating into the engine directly. 
Mod Companion is a meta-program external to the engine that manipulates project files and 
interfaces with the game to run console commands.

## Not a "Source Engine IDE"

At first glance, it may seem like Mod Companion is meant to be some kind of general-purpose Source Engine Development Environment. 
And while it does present a lot of the same tools a general Source IDE probably would, that's not the goal.

Mod Companion is first and foremost built to solve **real problems** we encountered during the 
development of [Portal: Revolution](https://portalrevolution.com) and its sequel:

- Texture creation using traditional community tools is tedious. Iteration speed is low
- Strata Source uses a custom VTF format that most community tools don't support
- Assets have no clear source of truth. If somebody just provides some mdl and vtf files, it doesn't allow us to edit them easily
- Asset creators each have their own way of creating assets. 
There is no consistent asset creation pipeline that allows anybody to work on any asset
- Compiling 40+ campaign maps is tedious and takes a long time. Core mappers may always have very up-to-date BSP files, 
but not everyone works on all maps
- Our deployment setup heavily relied on manually maintained BSP file caches on a single machine

## Assets

Two systems helps us with the asset creation issues: Asset Database and Conversion Agent

### Asset Database

Mod Companion scans the entire game project to find asset sources and game assets. 
A new asset definition file (.mca) helps to identify assets that are not identifiable from existing Source Engine file formats. (Mainly used for textures)

### Conversion Agent

Mod Companion automatically converts raw asset files into their game engine file format counterparts. 

For example, as soon as a PNG file changes on disk, it gets converted to a VTF in the background, 
using the correct settings and put in the right place.  
If the game is running, Mod Companion even signals the game to reload the texture. 
This enables a live hot-reloading workflow. As soon as you export your texture, it's visible in the game

## Maps

Mod Companion includes a map batch compiler to automatically build multiple maps without having to open Hammer

Even cooler: If you connect an S3 bucket, Mod Companion can download BSP files from it. 
On Portal: Revolution 2 we use this to download BSPs that are compiled on a dedicated machine every time a vtf file gets updated to in our version control

## Other features

There's a bunch of other small features, such as:

- Game console attached to the running game
- Launchers for game configs and tools
- FGD build runner
- Hotspot texture creation
