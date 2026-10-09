# Game Interop

Mod Companion can communicate with a running instance of a Source Engine game using console commands. 
This requires the game to be started with the `-netconport 8020` command line parameter.

Game Interop has to be active for [Asset Hot Reloading](/user-guide/asset-hot-reloading) and the [Game Console](/user-guide/panels/game-console) to function.


---

When Game Interop is active, the game launcher turns green with an accompanying icon.

![Game launcher turns green](/img/diagrams/game_interop_active.png)

---

:::tip
Starting the game through Mod Companion in `Game (Dev)` or `Game (Tools)` mode automatically appends the `-netconport 8020` parameter.
:::

It has been tested with Strata Source on Windows 11 and KDE Plasma 6 (Arch Linux).
