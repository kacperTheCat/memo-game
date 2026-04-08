# Contracts: Post-Match Win Screen (006)

## Purpose

Document **routing**, **DOM test hooks**, and **reuse of 004 storage** so Vitest, Playwright, and implementation stay aligned with [`spec.md`](../spec.md) and [`data-model.md`](../data-model.md).

## Storage (normative reference)

| Key | Definition |
|-----|------------|
| `memo-game.v1.completedSessions` | Same as [004 `contracts/README.md`](../004-game-core-logic/contracts/README.md): JSON array of **`CompletedSessionRecord`**. Ledger shows **`outcome === 'won'`** only. |
| `memo-game.v1.inProgress` | Unchanged; cleared on finalize (**004**). |

No new storage key for **006** v1.

## Routing

| Path | Notes |
|------|--------|
| **`/game`** | **Only** play surface URL. Post-match debrief is a **UI mode** on this route (no separate win path). Playwright uses **`/game`** + **seeded** deal for full-path tests (**FR-012**). **FR-013:** Full reload while debrief is showing must yield **board + new deal** (same difficulty), not debrief. |
| **`/briefcase`** | Hub route. **FR-014:** Entering this route **clears** win debrief UI state so a later **`/game`** visit does **not** show debrief without a **new** win. |

## DOM / test hooks (additive)

All **`data-testid`** values are **stable** for Playwright.

| `data-testid` | Element |
|---------------|---------|
| `win-debrief-root` | Root wrapper of debrief view |
| `win-summary-time` | Elapsed time value (e.g. `02:45`) |
| `win-summary-moves` | Move count value |
| `win-play-again` | Primary Play Again control |
| `win-return-briefcase` | Return to Briefcase control |
| `win-history-table` | `<table>` or `role="table"` root |
| `win-history-empty` | Empty state container (visible when no **won** rows) |

Implementations MAY add row-level **`data-testid`** (e.g. `win-history-row-0`) if needed for ordering tests.

## English copy

User-visible strings on this view MUST be **English** (constitution). Headings should align with spec/Stitch: e.g. **Post-Match Debrief**, **Operation Complete**, **History Ledger**, **Local Data**, **Return to Briefcase**, **Play Again**.
