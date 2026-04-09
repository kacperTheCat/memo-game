# Data model: 013 layout refactor & visual E2E

This feature does **not** introduce new persisted entities or API payloads. Below are **logical** entities for layout and testing traceability.

## Screen (route-level)

| Field | Description |
|-------|-------------|
| `routePath` | `/`, `/game`, `/briefcase` |
| `purpose` | Primary user-facing surface for visual baseline |
| `stableSelectors` | Existing `data-testid` and landmarks used for screenshot anchors |

**Relationships**: Each screen maps to one Playwright describe block or file in the visual suite.

## Layout region (game)

| Field | Description |
|-------|-------------|
| `container` | DOM wrapper around `GameCanvasShell` and related chrome in `GameView.vue` |
| `headerBand` | Back / abandon controls row |
| `playColumn` | Centered column containing the canvas shell (`max-w` + alignment) |

**Validation rules**:

- Horizontal alignment: header and play column share the same centerline on desktop reference width (asserted in E2E).
- Mobile: no horizontal scroll for default difficulty at reference mobile width.

**State transitions**: N/A (presentational).

## Visual baseline (artifact)

| Field | Description |
|-------|-------------|
| `screenId` | `home` \| `game` \| `briefcase` |
| `viewport` | Width × height (document in `contracts/README.md`) |
| `snapshotPath` | Playwright-managed PNG under `e2e/` snapshot directory |
| `preconditions` | e.g. game URL with fixed `seed` and `difficulty` |

**Validation rules**:

- Baseline committed to git for Chromium + fixed viewport.
- Updates require intentional `playwright test --update-snapshots` with review.

## Storage impact

**None** for 013 — continue using existing `localStorage` contracts from 004 / 006 / 012; refactor must not rename keys or formats.
