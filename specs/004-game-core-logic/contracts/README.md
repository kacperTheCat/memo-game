# Contracts: Game Core Logic (004)

## Purpose

Define **stable, versioned** shapes for **client-side persistence** and **test-visible hooks** so implementation, Vitest, and Playwright stay aligned with [`spec.md`](../spec.md).

## Storage keys (normative)

| Key | Content |
|-----|---------|
| `memo-game.v1.inProgress` | JSON string: in-progress `SessionSnapshot` ([`session-storage.schema.json`](./session-storage.schema.json)). Consumers MUST apply `snapshot.session.difficulty` to shared game settings (or equivalent) on restore so layout, hit-testing, and **`identityIndex` → tile image** mapping use one consistent **`n`** (see spec **FR-013**). |
| `memo-game.v1.completedSessions` | JSON string: `CompletedSessionRecord[]` (array schema subset—see below). |

Implementations MAY bump `v1` → `v2` only with a migration note in code and plan.

## DOM / test hooks

- `data-testid="game-canvas"`: primary hit target.
- `data-testid="game-grid-meta"`: attributes `data-rows`, `data-cols`, `data-cells` (strings) for e2e to derive **one** cell center without scanning every pixel.

## Playwright / integration notes

- **Workers**: Each Playwright test runs in an isolated `BrowserContext`; `localStorage` is **not** shared across parallel workers. Effects that look like “cross-test” noise usually come from **multiple steps in one test** or **timing** against persistence, not worker crosstalk.
- **In-progress debounce**: Writes to `memo-game.v1.inProgress` are **debounced** (currently ~300ms in `gameSession`). Clearing the key **before** the first flush can still lose to a **pending timer** that runs **after** `removeItem`. Tests that need a clean slate after `/game` should **wait until the key is present**, then remove it, or prefer **in-app** navigation (e.g. Return to Briefcase) and **confirm** flows instead of a bare `page.goto('/briefcase')` when the next visit must be a **new** deal from Briefcase settings.
- **`data-deal-init`**: Snapshot **restore** uses `hydrateFromSnapshot`, which sets deal-init to **`random`** by design. `random` after an intended seeded unlock usually means **`loadInProgressSnapshot()` took precedence** over `history.state.memoDealInit`, not flaky parallelism.
- **Full reload vs SPA**: `page.goto('/briefcase')` resets Pinia but can leave **`memo-game.v1.inProgress`** populated; the next `/game` load may **restore** that snapshot instead of consuming a fresh **`memoDealInit`** payload.

## JSON Schema

- [`session-storage.schema.json`](./session-storage.schema.json) — in-progress snapshot.
- **Completed session array:** each element MUST include `sessionId`, `difficulty`, **`clickCount`** (tile picks, for statistics), `activePlayMs`, `completedAt` (ISO-8601), `outcome` (`won` | `abandoned`). Rows with **`abandoned`** are written when the player uses **Abandon game** (top-left) or confirms abandon when starting **`/game`** from **The Briefcase** with a conflicting difficulty (**FR-014**); **`won`** when the grid is cleared. A formal array schema can be added when the statistics feature ships.

## English copy

User-visible errors (e.g. storage quota) MUST be **English** per constitution.
