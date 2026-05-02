# Quick Links — Mattermost plugin

Add admin-configurable shortcuts to the Mattermost **product switcher menu**
(the menu in the top-left corner where Channels, Boards, and Playbooks live).
Each shortcut opens its URL in a new browser tab and registers a matching
slash command, so users on the mobile app — which does not show the product
switcher — can still get the link by typing the trigger.

> Built and tested against Mattermost server **9.0+**. The plugin is web-app
> first; the server side is a thin endpoint serving the configured items and
> dispatching slash commands.

## Why

A common pattern in self-hosted teams is to keep small internal web tools
(Grafana, Wiki, Vault, an internal dashboard, monitoring page, etc.) one
click away from chat. Mattermost has product slots like Channels and Boards
but no built-in way to add arbitrary "go to this URL" entries. This plugin
fills that gap.

## What it does

- Adds rows to the product switcher menu, one per admin-configured item.
- Each row has its own icon — pick from Mattermost's full compass-icons
  library (325 icons, grouped into 19 categories with substring search) or
  upload your own PNG / SVG / WEBP / GIF / JPEG (max 64 KB; SVGs are
  sanitised on upload).
- Clicking a row opens the configured URL in a new browser tab. The
  Mattermost tab stays where it was — your conversation is not interrupted.
- Each item registers a slash command (e.g. `/wiki`) that posts an ephemeral
  message containing a link to the same URL. Auto-deletes after a
  configurable TTL so the chat stays clean.
- Drag-and-drop in the System Console table to reorder items.

## Why "open in a new tab" instead of embedding

The plugin used to support an `<iframe>` mode that embedded the page inside
Mattermost. We removed it because the practical surface for it turned out to
be tiny:

- The Mattermost **desktop client** (Electron) ships a strict CSP that
  silently blocks iframes to arbitrary external domains. There is no plugin
  setting to relax it ([mattermost/desktop#1109][desktop-1109]).
- The Mattermost **mobile client** does not render the product switcher at
  all, so iframe vs. external is irrelevant there.
- For **web** users, most real-world target sites set
  `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors`,
  leaving the iframe blank with no error event the plugin can react to.

The "open in new tab" path works in every client, on every target site, with
no surprises.

[desktop-1109]: https://github.com/mattermost/desktop/issues/1109

## Install

1. Download or build `krotos139.quick-links-<version>.tar.gz` (see
   [Build](#build)).
2. In Mattermost, go to **System Console → Plugins → Plugin Management →
   Upload Plugin** and upload the tarball.
3. Enable the plugin from the same page.
4. Open **System Console → Plugins → Quick Links** to add items.

## Configure

In **System Console → Plugins → Quick Links**:

| Field | Notes |
| --- | --- |
| **Links** | Custom table editor. Click **Add** to create a row, drag the handle to reorder, click **Edit** / **Delete** per row. |

Each row has:

| Field | Required | Notes |
| --- | --- | --- |
| **Name** | yes | Shown in the product switcher and the slash command response. |
| **Slash command trigger** | yes | Without the leading slash. Lowercase letters, digits, `_`, `-`. Must be unique across rows. |
| **URL** | yes | Absolute, must start with `http://` or `https://`. |
| **Icon** | no | **From library** — pick a compass-icons name from the grid (search by substring). **Upload** — PNG / SVG / WEBP / GIF / JPEG, max 64 KB. SVGs are sanitised on upload. Falls back to a globe icon if nothing is set. |
| **Slash command response auto-delete** | no | Seconds. `0` = never delete. Default 60 s. |
| **Enabled** | yes | Disabled rows stay in the config but do not register a menu entry or slash command. |

Save in the System Console after editing. **Slash commands update live**;
**menu changes need a Mattermost UI reload** (registering / unregistering a
product cleanly is not exposed by the plugin SDK at present).

## Use

- **Web / desktop**: click the item in the product switcher → URL opens in a
  new browser tab → Mattermost stays on the page you were on.
- **Mobile / web / desktop**: type the configured slash command (e.g.
  `/wiki`) → an ephemeral post appears in the channel with a markdown link
  to the URL. Tap / click the link to open the page. The post auto-deletes
  after the configured TTL.

## Build

`make` is **not** required. The `npm` scripts at the repo root drive the
build end-to-end (Go for the server, webpack for the webapp, then a
tarball).

```bash
# One-time
npm install
npm run webapp:install

# Full release build — cross-compiles for linux / darwin / windows × amd64 / arm64.
# Use this when the Mattermost server runs on a different OS/arch from your
# build machine (the normal case — most MM servers are Linux).
npm run dist

# Faster host-only build for dev iteration. The resulting bundle ONLY
# contains a binary for your current OS/arch.
npm run dist:current
```

Output: `dist/krotos139.quick-links-<version>.tar.gz`.

If you have `make` installed, the upstream Mattermost
plugin-starter-template `Makefile` is preserved and works (`make dist`,
`make deploy`, etc.).

### Toolchain

- Go 1.25+
- Node 22 + npm 11

## Layout

```
plugin.json                Plugin manifest (id, version, settings schema).
assets/icon.svg            Default icon shown for the plugin in System Console.
server/                    Go. HTTP endpoint + slash command lifecycle + bot.
  api.go                   GET /api/v1/items — what the webapp fetches at init.
  commands.go              Register / dispatch / auto-delete the per-item commands.
  configuration.go         Mirrors plugin.json settings, drives reconcile on change.
  items.go                 JSON shape of one item (Go side).
  plugin.go                Lifecycle hooks (OnActivate / OnDeactivate).
webapp/                    TypeScript + React. Registers products, renders editor.
  src/components/          ExternalRedirect, ProductHeaderTitle, settings/* (table, modal, picker, upload).
  src/data/preset_icons.ts All 325 compass-icons names, grouped into picker categories.
  src/types/item.ts        WebframeItem type + JSON parser/coercer.
  src/utils/               Icon CSS injection, SVG sanitiser.
  src/index.tsx            initialize(): admin custom setting + registerProduct loop.
build/manifest/            Tool that copies plugin.json into server/manifest.go and webapp/src/manifest.ts.
scripts/                   Node build orchestration (no make required).
```

## Caveats

- **Menu changes need a UI reload** to take effect. Slash commands update
  live without one.
- **Custom uploaded icons** ride a `data:` URL embedded in the plugin
  config. Keep them small (the editor enforces 64 KB pre-encoding). For
  larger / animated assets, prefer **From library** or upload to the
  Mattermost server and reference via a URL on the target page itself.
- **Slash trigger collisions** with built-in or other plugins' commands are
  not detected by this plugin — Mattermost's `RegisterCommand` simply wins
  or loses depending on registration order. Pick distinctive triggers.

## Contributing

Bug reports and patches welcome. Before opening a PR:

```bash
# Type-check and build the webapp.
cd webapp && npm run check-types && npm run build

# Build the server for the host platform (verifies Go compiles).
cd ..
npm run server:current
```

Run `npm run dist` once before submitting to make sure the full bundle
assembles cleanly across all five platforms.

## Build flavour

`npm run dist` produces optimised Go binaries with full debug symbols
(`-trimpath` only — same flags Mattermost's plugin-starter-template
Makefile uses). Optimisations and inlining are on; you get readable function
names in panic stack traces but pay an extra ~30% in binary size compared
to a fully stripped release.

If you want smaller binaries — e.g. for shipping to a tightly bandwidth-
constrained registry — pass `-ldflags='-s -w'` to `go build` in
`scripts/build_server.mjs`. Stack traces then lose function names and
DWARF info.

## License

Apache 2.0 — see [LICENSE](LICENSE).
