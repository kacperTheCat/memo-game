# Contracts: 013 layout refactor & screen visual E2E

## Persistence

**No new `localStorage` or `sessionStorage` keys.** Continue to honor:

- [`specs/012-pwa-offline-install/contracts/README.md`](../012-pwa-offline-install/contracts/README.md) for `memo-game.v1.playerSettings`, `memo-game.v1.pwaInstallUi`
- Prior specs for `memo-game.v1.inProgress`, `memo-game.v1.completedSessions`

Refactors MUST NOT change key names, JSON shapes, or migration behavior without a new feature number and schema version.

## Visual E2E contract

| Screen | Route | Preconditions | Suggested screenshot target |
|--------|-------|---------------|----------------------------|
| Home | `/` | Default load | Main landmark or `body` viewport |
| Game | `/game` | `?difficulty=medium&seed=111222333` (nine digits) | Canvas container or `main` region (prefer locator to reduce flake) |
| Briefcase | `/briefcase` | Default load | Main briefcase panel root |

**Viewport (authoritative for baselines)**: Match Playwright project default from root `playwright.config.ts` — `Desktop Chrome` device profile (typically 1280×720 CSS px unless Playwright overrides).

**Stability**:

- Game route MUST use a **fixed nine-digit seed** so tile faces and positions match snapshot.
- Wait for **visible** shell/canvas (`data-testid` such as `game-canvas` where applicable) before capture.

**CI**: Specs run under existing `pnpm exec playwright test` job (Chromium). Snapshot updates are developer-driven (`--update-snapshots`), not auto-generated in CI.

## Layout E2E contract (P1)

**Spec file**: `e2e/game-layout-balance.spec.ts` (name may be merged with an existing game spec if reviewers prefer fewer files).

**Minimum assertions** (example patterns — implementation may vary):

- `boundingBox()` of the canvas (or shell) has horizontal position consistent with **centering** within the viewport (e.g. symmetric margins within tolerance).
- At a **mobile** viewport width (e.g. 390×844), canvas remains visible without horizontal scroll (`scrollWidth` vs `clientWidth` on `document.documentElement` or `body`).

Tolerances should be **CSS pixels**, accounting for rounding (±2 px acceptable unless product tightens).

## Attribution

Tile imagery: **[ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API)** (MIT). Unchanged.
