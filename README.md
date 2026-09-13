# deck-rgb-sync

A Decky Loader plugin for SteamOS/Bazzite that connects to a locally-running OpenRGB server and drives your RGB devices based on system state!

## Features
- **RAM Meter Mode**: Lights up your RGB zones proportionally based on your system RAM usage.
- **Download Progress Mode**: While downloading a game on Steam, tracks the download progress automatically on your RGB zones. (Overrides RAM mode while downloading).
- **Solid Color**: Pick a solid color for your RGB zone.
- **Off by Default**: Does nothing until you explicitly enable it in the Decky menu.
- **Dynamic Device Support**: Automatically enumerates your OpenRGB devices and zones, letting you select exactly which ones to light up.

## Prerequisites

- You must have **OpenRGB** installed and running with its SDK server enabled (default port `6742`).
- **Decky Loader** installed.

## Installation

1. Grab the latest release `.zip` from the [Releases](https://github.com/mysticle/deck-rgb-sync/releases) page.
2. Transfer it to your Deck/Bazzite device.
3. Install it using Decky's install mechanism or copy it directly into `/home/deck/homebrew/plugins/`.
4. Restart your device or reload Decky plugins.

## Building from source

1. Ensure you have `pnpm` and Node.js installed.
2. Clone this repository: `git clone https://github.com/mysticle/deck-rgb-sync.git`
3. Install dependencies: `pnpm i`
4. Build the plugin: `pnpm run build`
5. The output zip will be available in the `out/` directory.

## Troubleshooting

- **OpenRGB not detected**: Ensure OpenRGB is running and the SDK server is enabled on `localhost:6742`.
- **No devices found**: Make sure OpenRGB detects your hardware. Click "Refresh Devices" in the plugin UI.
- **Lights not changing**: Ensure the "Enable RGB Sync" toggle is ON and you've selected a valid Device and Zone in the dropdowns.

## License
MIT License
