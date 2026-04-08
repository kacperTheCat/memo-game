# Data model: Post-Match Win Screen

**Spec**: [`spec.md`](./spec.md) | **Branch**: `006-win-game-screen`  
**Extends**: [`specs/004-game-core-logic/data-model.md`](../004-game-core-logic/data-model.md) — **`CompletedSessionRecord`**, **`GameSession`**, storage keys

## Persistence (unchanged)

- **`memo-game.v1.completedSessions`**: append-only list of **`CompletedSessionRecord`** (includes **`won`** and **`abandoned`**).
- **`memo-game.v1.inProgress`**: cleared when a round finalizes (**004** behavior).

This feature **does not** add fields to **`CompletedSessionRecord`** for v1.

---

## View logic: `WinDebriefSummary` (derived, not stored)

Computed for the **left column** stat cards.

| Field        | Source                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| `elapsedMs`  | `gameSession.status === 'won'` → `gameSession.activePlayMs`; else newest **`won`** row **`activePlayMs`** |
| `moveCount`  | Same branch → `clickCount`                                           |
| `difficulty` | Same branch → `difficulty` (**Easy / Medium / Hard** label in UI)   |
| `sessionId`  | Same branch → `sessionId` (optional, for debugging / future use)      |

**Validation:** If **`/game`** is in **debrief** mode but no **`won`** summary can be resolved, **do not** show debrief—fall back to **board** or **redirect** to **`/briefcase`** per [`research.md`](./research.md).

---

## View logic: `HistoryLedgerRow` (display projection)

Each row = one **`CompletedSessionRecord`** with **`outcome === 'won'`**, sorted by **`completedAt`** **descending** (newest first).

| Column (UI) | Source / rule |
| ----------- | ------------- |
| Date        | `completedAt` → `YYYY-MM-DD` (local timezone; consistent with formatter tests) |
| Difficulty  | `difficulty` → label + chip variant |
| Time        | `activePlayMs` → `MM:SS` |
| Moves       | `clickCount` |

**Empty state:** Zero **`won`** rows → show English empty message; still show **current** summary if summary source exists (edge: first-ever win—at least one **`won`** row exists after finalize).

---

## Navigation state machine (conceptual)

| From              | Action           | Result |
| ----------------- | ---------------- | ------ |
| `/game` (board)   | Win              | Append **`won`** row, clear in-progress storage, **`gameSession.status === 'won'`**, UI mode → **debrief** (URL unchanged) |
| `/game` (debrief) | Play Again       | UI mode → **board**; **`beginSession(difficulty)`**; canvas **`startNewRound`** (new random deal) |
| `/game` (debrief) | Return to Briefcase | **`router.push('/briefcase')`**; session cleanup per **`research.md`** §8–§9 (**FR-014**) |
| **`/game` (debrief)** | **Full page reload** | **No debrief after load**; **new** **`in_progress`** game at **same difficulty**, **new deal**—**Play Again**–equivalent (**FR-013**); **`completedSessions`** unchanged |
| **Any route → `/briefcase`** | **Route entered** | **Clear win debrief presentation state**; **`gameSession`** must **not** stay **`won`** in a way that revives debrief on next **`/game`** (**FR-014**) |
| `/game` (invalid debrief) | Mount / restore | No **`won`** context → no orphan debrief (board or hub) |

---

## Relationships

- **`WinDebriefSummary`** reads **Pinia** **`gameSession`** first, else **`readCompletedList()`** from **`useGameSessionStore`**.
- **`HistoryLedgerRow[]`** reads **`readCompletedList()`** filtered **`outcome === 'won'`**.
