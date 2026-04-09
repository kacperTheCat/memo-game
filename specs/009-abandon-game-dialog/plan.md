# Implementation Plan: Abandon confirmation app dialog (009)

**Branch**: `009-abandon-game-dialog` | **Date**: 2026-04-09 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/009-abandon-game-dialog/spec.md` (includes **Clarifications** session 2026-04-09: **Unlock showcase** + any **in_progress** → dialog; **new** deal on confirm, not silent resume).

## Summary

In-app **`MemoConfirmDialog`** for **Abandon Game** on `/game` and for **Unlock showcase** from the Briefcase whenever **`gameSession.status === 'in_progress'`** (**FR-002**), **including matching** Briefcase difficulty/seed—**Unlock** means a deliberate **new** deal after confirm; **`resumeToGame` / Return to Game** stays without this dialog. **`useBriefcaseNavigateToGame`** must **`await requestConfirm(message)`** for that broader condition (not mismatch-only), then **`finalizeSession('abandoned')`**, **`play.resetRound`**, **`router.push`** with **`memoDealInit`** so **`GameCanvasShell`** starts fresh. Optional second **`appCopy`** line for “same settings, new deal” vs mismatch (**spec Assumptions**). No new **`localStorage`** keys.

**Technical approach:** Adjust composable guard + message selection (**[`research.md`](./research.md) §7**); **`BriefcaseView`** Promise bridge unchanged in shape. Vitest + Playwright scenarios **4–6** (mismatch, **matching** settings, outcomes).

## Technical Context

**Language/Version**: TypeScript **5.7**, Node **22.x** (root `package.json`)  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), `vite-plugin-pwa`  
**Storage**: No change — `localStorage` keys `memo-game.v1.inProgress`, `memo-game.v1.completedSessions`  
**Testing**: Vitest **3** (`src/**/*.spec.ts`), Playwright **~1.49** (`e2e/`)  
**Target Platform**: Modern browsers (Chromium, Firefox, Safari)—[`research.md`](./research.md) §5  
**Project Type**: SPA (Vue) — dialog overlay; canvas gameplay unchanged  
**Performance Goals**: Dialog open/close <100 ms to interactive; no canvas frame impact  
**Constraints**: English copy; PWA/offline unchanged; no new modal npm deps  
**Scale/Scope**: Composable + copy + tests delta for **FR-002** widening

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind.
- [x] **Canvas**: Unchanged; dialog is chrome only.
- [x] **Performance**: Dialog budget stated above.
- [x] **Responsive + PWA + state**: Client-side persistence unchanged.
- [x] **Tests**: Playwright `e2e/abandon-confirmation-dialog.spec.ts` maps to US1 + US2 scenarios **1–6**; Vitest composable + views.
- [x] **Assets**: N/A.
- [x] **Copy + browsers**: English; matrix in `research.md` §5.
- [x] **Accessibility**: Pointer-first; dialog ARIA per `research.md` §4.
- [x] **Repo layout**: Single `package.json`; `e2e/` + Vitest colocated.
- [x] **Design**: Memo/Tailwind panels; Stitch optional.
- [x] **CI**: Vitest → build → preview → Playwright when present.
- [x] **Scope**: Non-commercial / portfolio context.

## Project Structure

### Documentation (this feature)

```text
specs/009-abandon-game-dialog/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── confirm-dialog-ui.md
└── tasks.md              # /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── components/ui/MemoConfirmDialog.vue
├── composables/useBriefcaseNavigateToGame.ts   # in_progress + Unlock → requestConfirm (all matches)
├── views/GameView.vue
├── components/briefcase/BriefcaseView.vue
├── constants/appCopy.ts                         # optional second Unlock message (matching case)
e2e/abandon-confirmation-dialog.spec.ts
```

**Structure Decision**: Single Vue SPA; composable owns navigation predicate; view owns dialog UI.

## Phase 0–1 outputs

| Artifact | Purpose |
|----------|---------|
| [`research.md`](./research.md) | Modal + **§7 Unlock trigger & copy** |
| [`data-model.md`](./data-model.md) | Ephemeral UI; confirm sequences |
| [`contracts/confirm-dialog-ui.md`](./contracts/confirm-dialog-ui.md) | UI testids |
| [`quickstart.md`](./quickstart.md) | Manual + test commands |

## Implementation notes

### Game abandon (US1)

Unchanged: dialog on **Abandon Game**; confirm → finalize + clear + briefcase.

### Unlock showcase (US2, **FR-002** post-clarification)

1. **`navigateToGame`**: After seed-incomplete guard, if **`session.gameSession?.status === 'in_progress'`**, **`await requestConfirm(copy)`** — **always**, not only on difficulty/seed mismatch.
2. **`copy`**: **`briefcaseUnlockAbandonInProgress`** when mismatch; add **`briefcaseUnlockNewGameSameSettings`** (or reuse one string) when settings match—**[`research.md`](./research.md) §7**.
3. Confirm: **`finalizeSession('abandoned')`**, **`play.resetRound`**, **`router.push`** — ensure game entry path deals **new** round (not stale resume-only).
4. **`resumeToGame`**: no **`requestConfirm`**.

### Tests

- Vitest: **`useBriefcaseNavigateToGame.spec.ts`** — in_progress + **same** difficulty/seed → **`requestConfirm`** called; false → no push; true → push.
- Vitest: **BriefcaseView** — matching-settings unlock shows dialog.
- Playwright: scenario **5** (matching + dialog + confirm → game + fresh deal signal if assertable).

## Complexity Tracking

None.
