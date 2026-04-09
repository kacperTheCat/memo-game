# Contracts: 012 PWA offline persistence and install prompt

## `localStorage` keys

| Key | Format | Purpose |
|-----|--------|---------|
| `memo-game.v1.playerSettings` | JSON: **`PlayerSettingsV1`** ([`player-settings.schema.json`](./player-settings.schema.json)) | Persisted briefcase defaults: difficulty + seed field text. |
| `memo-game.v1.pwaInstallUi` | JSON: **`PwaInstallUiStateV1`** ([`pwa-install-ui.schema.json`](./pwa-install-ui.schema.json)) | Remember install sheet dismiss vs installed. |

**Unchanged (004 / 006):**

| Key | Notes |
|-----|--------|
| `memo-game.v1.inProgress` | In-progress `SessionSnapshot`; debounced writes. |
| `memo-game.v1.completedSessions` | Append-only completed rows. |

## Query string vs persisted settings

- **`/game?difficulty=`** and **`?seed=`** (existing **`GameView`** behavior) SHOULD apply on navigation.
- **Recommendation:** After applying query overrides, **update** `PlayerSettingsV1` so the next cold load matches the last explicit navigation intent (avoids “query said hard, reload said medium”). If product prefers “URL always wins over persistence,” document the opposite in implementation — spec allows either if UX stays coherent; default here is **sync persistence after query apply**.

## Install prompt callable surface (informal)

Consumers:

- **`window.addEventListener('beforeinstallprompt', …)`** — capture + `preventDefault()`.
- **`window.addEventListener('appinstalled', …)`** — set outcome **`installed`**.
- **`deferredPrompt.prompt()`** — user gesture only (Install button).

**Testing hook (optional):** `window.__MEMO_TEST_BEFORE_INSTALL_PROMPT` or `data-testid` on sheet root — only if needed for stable Playwright; gate behind test mode if used.

## Attribution

Tile imagery and metadata: **[ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API)** (MIT). No runtime dependency on the API for gameplay (constitution).
