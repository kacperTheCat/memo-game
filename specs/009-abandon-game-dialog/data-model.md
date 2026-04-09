# Data model: 009-abandon-game-dialog

## Persistent / snapshot domain

**No changes.** `SessionSnapshot`, `GameSession` status transitions (`in_progress` → `abandoned` on confirm), and `localStorage` keys **`memo-game.v1.inProgress`**, **`memo-game.v1.completedSessions`** remain as implemented in **`gameSession`** / **`gamePlay`**.

## Ephemeral UI state (Vue only, not serialized)

| Concept | Location | Purpose |
|---------|----------|---------|
| Dialog open flag | `GameView` ref | Controls **`MemoConfirmDialog`** visibility for abandon flow |
| Dialog open flag + pending navigation | `BriefcaseView` ref | Same component; shown when **`navigateToGame`** runs while **`gameSession.status === 'in_progress'`** (Unlock path), including matching Briefcase settings |
| `requestConfirm` Promise | In-memory during user gesture | Resolves **true** on confirm, **false** on cancel/dismiss; bridges composable and dialog |

**Validation:** Only one confirmation dialog instance per view at a time; opening while already open is a no-op (spec edge case: no stacked dialogs).

## Relationships

- **Confirm** on game abandon → existing sequence: `finalizeSession('abandoned')`, `clearReloadNewGameDifficulty`, `play.resetRound`, `session.clearSession`, route to **briefcase**.
- **Confirm** on Unlock + in progress (mismatch or match) → `finalizeSession('abandoned')`, `play.resetRound`, then **`router.push`** to **game** with `memoDealInit` state → **new** deal per Briefcase settings (not silent resume of prior board).

No new entities or API contracts beyond UI component props/events ([`contracts/confirm-dialog-ui.md`](./contracts/confirm-dialog-ui.md)).
