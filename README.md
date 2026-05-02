# Web Frames — Mattermost plugin

Adds admin-configurable web pages to Mattermost as items in the **product
switcher menu** (the same menu where Channels / Boards / Playbooks live). Each
item is rendered in an `<iframe>` (or opened in a new browser window). The
plugin also registers a matching slash command per item, so users on the
mobile app — which does not show the product switcher — can still get a quick
link to the resource.

> **Status: scaffolding (milestone 1).** A single hardcoded item
> (`https://example.com/`) is registered as a smoke test. The admin-configurable
> table editor and slash commands land in the next milestones.

## Build

`make` is **not** required. The `npm` scripts at the repo root drive the build
end-to-end (Go for the server, webpack for the webapp, then a tarball).

```bash
# One-time
npm run webapp:install

# Full build — cross-compiles for linux/darwin/windows × amd64/arm64.
# Use this whenever the Mattermost server runs on a different OS/arch than
# your build machine (which is the normal case — most MM servers are Linux).
npm run dist

# Host-platform-only build. Faster, but the resulting bundle ONLY contains a
# binary for your current OS/arch, so Mattermost will refuse to start it on
# any other platform. Only use this when your build machine and your test
# Mattermost server are the same OS/arch.
npm run dist:current
```

Output: `dist/com.frame.webframes-<version>.tar.gz` — upload this in **System
Console → Plugins → Plugin Management → Upload Plugin**.

If you have `make` installed, the upstream starter-template `Makefile` is also
preserved and works (`make dist`, `make deploy`, etc.).

## Caveats to know about up front

- **`X-Frame-Options` / CSP `frame-ancestors`** on the embedded site decide
  whether the iframe loads at all. Most public SaaS apps set these and will
  appear blank inside the iframe — switch the item to "open in new window" in
  that case (this option lands with the editor in milestone 2). Browsers do
  not fire `onError` for X-Frame-Options blocks, so the iframe just stays
  empty; the fallback link is the user escape hatch.
- **Mobile clients** do not render the product switcher — that is the entire
  reason the slash commands exist. Links posted by the slash command open in
  the device's default browser.
- **Desktop client** historically blocks some external navigation patterns
  inside iframes (see `mattermost/desktop#1109`); behaviour to be re-tested
  per-target site.

## Layout

```
plugin.json              Mattermost plugin manifest
assets/icon.svg          Default icon used in System Console (frame + screwdriver)
server/                  Go: thin server side. Slash commands land here next.
webapp/                  TS/React: registerProduct + iframe view + (later) admin UI.
build/manifest/          Tool that propagates plugin.json → server/manifest.go and webapp/src/manifest.ts.
scripts/                 Node-based build orchestration (replaces make).
```
