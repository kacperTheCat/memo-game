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

## JSON Schema

- [`session-storage.schema.json`](./session-storage.schema.json) — in-progress snapshot.
- **Completed session array:** each element MUST include `sessionId`, `difficulty`, **`clickCount`** (tile picks, for statistics), `activePlayMs`, `completedAt` (ISO-8601), `outcome` (`won` | `abandoned`). Rows with **`abandoned`** are written when the player uses **Abandon game** (top-left) or confirms abandon when starting **`/game`** from **The Briefcase** with a conflicting difficulty (**FR-014**); **`won`** when the grid is cleared. A formal array schema can be added when the statistics feature ships.

## English copy

User-visible errors (e.g. storage quota) MUST be **English** per constitution.
