# Asset Hot Reloading

Mod Companion automatically detects when game asset files change on disk and can ask the game to reload it. 

The reload signal is delivered using [Game Interop](/user-guide/game-interop.md).

Hot Reloading can be enabled and disabled under the Assets menu option.

![This is where the checkbox is](/img/diagrams/asset_hot_reload_checkbox.png)

---

Caveats:

:::warning
To reload individual textures, `mat_reloadtexture <texture-name>` is called. This command exists in Strata Source but is not present in Valve games.
:::