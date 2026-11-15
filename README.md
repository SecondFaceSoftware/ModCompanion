# Mod Companion

Modder's best friend <3

Mod Companion is a desktop app we built to help us create Portal: Revolution 2.

[Project Website](https://modcompanion.secondfacesoftware.com)  
[Discord](https://discord.gg/BDDxkNwXWw)

![Banner](art/readme_banner.png)

## User Documentation

Docs are here: https://modcompanion.secondfacesoftware.com/

## Development

Want to contribute? Here's how you can build the app yourself.

Mod Companion is an Electron app written in TypeScript. The frontend is built with VueJS, Nuxt UI and Tailwind.

### Prerequisites

You need

- Node 26
- NPM

### Set up appconfig.json

Some sample assets are included in the repository. **Don't push any changes you make to those, like when converting assets, unintentionally**

To use the sample, duplicate `appconfig.sample.json` as `appconfig.json`

Or if you want to use real data, set root to your Portal Revolution 2 repository and set searchPath to `revolution`
```json
{
  "root": "D:/Projects/...",
  "searchPath": "revolution"
}
```

### Install

```bash
# Install packages for deployment and such
npm ci

# Install packages for all the app packages
npm ci --workspaces
```

### Develop

```bash
# Start hot reloading
# Will run vite and tsc in watch mode to keep main and renderer up to date
npm run dev

# In another terminal:
# Start electron and listen to vite port
npm run run-dev
```

Caveats:

- `npm run dev` does not watch or reload changes to `preload.ts` or main assets. Restart the command when changing those

### Test production build without deploying
```bash
npm run build

npm run run-dist
```

### Deploy

```bash
npm run deploy
```

### Package overview

Mod Companion is split into a whole load of individual npm packages. It used to just be one, but has been split apart to allow for a headless CLI application to exist that doesn't depend on Electron

1. Shared - Pure typescript that can run in browsers and node. Runtime agnostic. Renderer, main, core and CLI all depend on this. Put shared type definitions and small pieces of logic code here that every part of the app needs
2. Core - Nodejs code that is shared by main and cli
3. Main - The Electron main process. Should be a minimal layer that maps features from Core to Electron APIs
4. Renderer - The Electron renderer process. Features browser code
5. Cli - The command line for mod companion to run some tasks on automated services

### Development FAQ

Very verbose, yes. Technology just isn't very black and white all the time

> __Q: Why electron, it's sooooo slow and bad!! Just use tauri or qt or wpf or.. 🤓☝__  
> A: Mod Companion started its life as a C# Avalonia UI app, which we eventually gave up on and decided to 
> rewrite in Electron from scratch. That rewrite offered better performance, smaller update bundles, 
> faster startup times, faster development iteration times, better debuggability and flexibility. 
> Different tech stacks are good for different things. Electron's main downside, that can't be disputed, 
> is its huge ~200mb bundle. But for a productivity app that you install once to ship your game, that 
> is a worthwhile tradeoff. 
> Mod Companion is not a small utility to flash a USB stick, where such a massive bundle would feel like bloat, 
> it's a productivity tool where we don't want to spend time implementing basic features.  
> You go write it in rust... let's see who ships their game first.

> __Q: Why is the app bundled so weirdly?__  
> A: Normally Electron apps bundle all their JavaScript into an app.asar file or into the main executable.
> This has the negative effect of requiring every user to update the entire 200mb Electron bundle every time a single line of JavaScript updates.
> There are security reasons for this, but that workflow felt unnecessary to us.  
> Mod Companion is rapidly iterated upon and that is a main pillar of our technology choices.
> We need to be able to ship an update to team members in 3 minutes to address bug as quicky as possible.  
> What we ship now is a minimal Electron bundle, which we call the production runtime. It contains no actual application logic. 
> The app logic is bundled and shipped as individual loose files. When the production runtime starts, it loads those loose bundles and launches the app from there.  
> This way, an app update consists of changing a few small JavaScript files, something Git is very good at handling. Team members then just need to pull a small diff consisting of a few kilobytes to get all the new functionality. No 200mb bundle update required. Results in FAR less LFS usage as well. (Your cool qt or wpf app would still need to ship a bunch of .dll files to LFS every update, wouldn't it?)

> __Q: EWWW!! Why do you ship binaries to git??!__  
> A: Because it's easy  
> Q: Nooo! you need to build your own update channel and download manager!  
> A: Simplicity is key. All files needed to develop the game are contained in a single repository. 
> Every team member can just pull the repo and start working right away, no setup required on their system,
> and no additional downloads. We also don't use submodules for the same reason. We really don't need even more infra to maintain...  
> LFS usage does increase of course, but so far we still only pay ~4€ per month for the 
> entire Portal: Revolution 2 repository (which contains the entire git history for Portal: Revolution 1 as well)
> and binaries are far from the biggest contributors.  
> Shipping all your binaries in git also has the added benefit that your entire team is always on the same
> page. You don't have someone working with an old editor on file formats it does not understand yet. 
> The biggest downside to this is that we currently have no clean way to ship preview versions or betas, or have multiple version streams in general. 
> A system like Unreal Game Sync would be great for this but so far it's not been a big enough reason for us to
> invent a bunch of new tech for this rather niche problem. 
> Remember, ultimately we're trying to ship a game here.