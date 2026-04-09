# Quickstart: 012 PWA offline persistence and install prompt

## Prerequisites

- Node **22.x**, `pnpm` — see root `package.json`.
- Production-like build (service worker + precache): **`pnpm vite build && pnpm vite preview --host 127.0.0.1 --port 4173`** (same as Playwright `webServer`).

## Manual checks

### A. Settings survive reload

1. Open app, go to **Briefcase**, select **hard**, enter a partial seed if desired.
2. Reload the page.
3. **Expect:** difficulty (and seed field) still match.

**Note:** `difficulty` / `briefcaseSeedRaw` are written on a short debounce and **flushed on `pagehide` / `beforeunload`**, so a very fast reload still persists the latest values.

### B. In-progress game survives reload

1. Start a game, flip / match some tiles.
2. Reload while **`in_progress`**.
3. **Expect:** board restores per existing snapshot rules (**004**).

### C. Offline round

1. With preview server running, open the app, wait for load to settle (SW active).
2. DevTools → **Network** → **Offline** (or unplug network).
3. Navigate **home → briefcase → game** (or refresh if routes are cached).
4. **Expect:** complete one round without network; tile images and SFX load from cache.

### D. Install sheet (Chromium)

1. Use a **non-installed** profile; HTTPS or `localhost` / `127.0.0.1` as required by the browser.
2. Meet **installability** criteria (manifest + SW; Lighthouse PWA checklist helps).
3. **Expect:** bottom sheet appears **once**; **Not now** hides it after reload; clearing site data resets.

## Automated tests

- `pnpm test` — Vitest (persistence helpers, install state reducer if extracted).
- `pnpm exec playwright test e2e/pwa-persistence-offline.spec.ts e2e/pwa-install-prompt.spec.ts` — after implementation (paths per [`spec.md`](../spec.md)).

## Clearing storage

- Application → **Clear site data** removes **`memo-game.v1.*`** including new keys — use to reset install prompt and settings.
