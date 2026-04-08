# Data Model: Home & Navigation Layout Alignment (007)

**Spec**: [`spec.md`](./spec.md) | **Plan**: [`plan.md`](./plan.md) | **Date**: 2026-04-08

## Overview

**007** does **not** introduce new persisted entities or **localStorage** keys. It reuses **004** / **006** shapes and adds **UI-only** rules for when navigation affordances appear.

## Persisted entities (unchanged)

### In-progress snapshot (`memo-game.v1.inProgress`)

| Field / use | Description |
|-------------|-------------|
| `schemaVersion` | Must be `1` for restore |
| `session` | `GameSession` with `status: 'in_progress'` |
| `cells`, `pair` | Board state for resume |

**007 behavior:** **Return to Briefcase** must leave this blob **consistent** with the last **`flushSave`**. **Abandon** clears it via existing **`finalizeSession` + clear path**.

### Completed session list (`memo-game.v1.completedSessions`)

| Field | Description |
|-------|-------------|
| `sessionId` | UUID |
| `difficulty` | `easy` \| `medium` \| `hard` |
| `clickCount` | Moves |
| `activePlayMs` | Active play time |
| `completedAt` | ISO timestamp |
| `outcome` | `won` \| `abandoned` |

**007 behavior:** **Home** and **debrief** ledger display **won-only** rows (same projection as **`filterWonSessionsNewestFirst`** in **`winDebriefHistory.ts`**).

## Derived UI state (non-persisted)

| Concept | Rule |
|---------|------|
| **In-progress session active** | `gameSession?.status === 'in_progress'` **or** restorable snapshot exists and **`GameView` / `GameCanvasShell`** has loaded it—implementation should align with today’s resume behavior on **`/game`**. |
| **Show Return to Game** | **True** iff player has a **resumable** in-progress session (same condition as today’s product for “continue” semantics). |
| **Post-match debrief visible** | `showDebrief && gameSession?.status === 'won'` on **`/game`** — **excluded** from **007** two-control chrome (**spec** edge case). |

## Relationships

- **Home** / **debrief** → read **`CompletedSessionRecord[]`** via **`readCompletedList()`** + **won** filter.
- **Abandon** → **append** completed row with **`outcome: 'abandoned'`**, then clear in-progress storage (existing store methods).

## Validation rules

- **Navigation** must not call **`clearSession`** on **Return to Briefcase** during **`in_progress`**.
- **Return to Game** must not **finalize** a session or **clear** in-progress storage.
- **FR-014**: Entering **`/briefcase`** with **`won`** still **clears** debrief presentation state (existing **`router.beforeEach`**).
