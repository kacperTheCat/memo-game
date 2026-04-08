# UI contract: game canvas (008-game-tile-polish)

End-to-end tests target the **existing canvas shell** surface. This contract lists stable hooks; implementation MUST preserve or update tests when renaming.

## Required `data-testid` (existing)

| Test id | Role |
|---------|------|
| `game-canvas-shell` | Board container; pointer events for parallax |
| `game-canvas` | The `<canvas>` element |
| `game-grid-meta` | SR-only grid rows/cols/cell count |
| `game-memory-debug` | SR-only revealed/matched counts (debuggability) |
| `game-initial-identities` | SR-only JSON for deterministic deals in E2E |

## Planned additions (`e2e/tile-visual-polish.spec.ts`)

| Test id | Purpose |
|---------|---------|
| `game-collect-strip` | SR-only region for **collected** merged chips (**FR-009**): e.g. `data-collect-count="{n}"` and/or `aria-label` summarizing count — enables Playwright to assert strip grows after a match within **SC-003** window without brittle pixel reads |
| `game-canvas-shell` `data-mismatch-phase` (optional) | Values `idle` \| `shake` \| `flip_back` — supports **FR-010** / **FR-013** ordered mismatch tests (shake before flip-back) |
| `game-tile-animation-state` (optional) | SR-only JSON blob: e.g. per-index flags `{ flipping, collecting, shaking }` — **add only if** flake-free and cheaper than screenshots |

**Note:** Prefer **behavioral** assertions (`data-matched` / `game-memory-debug`, **`data-collect-count`**, **`data-mismatch-phase`**) plus **optional** screenshot checks. Collect animation SHOULD be verifiable via **count of strip slots** + **matched cell count**, not only pixels.

## Accessibility

- Pointer-first; canvas remains the hit target (`cellIndexFromPointer` / existing handlers).
- Any new SR-only summary SHOULD be English per constitution.

## Out of scope

- No new public HTTP API or external contract.
