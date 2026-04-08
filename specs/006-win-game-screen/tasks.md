---
description: "Task list for 006 post-match win debrief (in-route on /game)"
---

# Tasks: Post-Match Win Debrief (006)

**Input**: Design documents from `/specs/006-win-game-screen/`  
**Prerequisites**: [`plan.md`](./plan.md), [`spec.md`](./spec.md), [`research.md`](./research.md), [`data-model.md`](./data-model.md), [`contracts/README.md`](./contracts/README.md), [`quickstart.md`](./quickstart.md)

**Tests (mandatory for this repository)**: Every user story includes failing-first **Vitest** and **Playwright** tasks per `.specify/memory/constitution.md`.

**Organization**: Tasks are grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in the same wave)
- **[Story]**: `[US1]` / `[US2]` / `[US3]` for user-story phases only
- Paths are relative to repo root `memo-game/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm baseline before feature changes.

- [x] T001 Run `pnpm run build` at repo root to confirm a clean baseline before implementing 006

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Seeded RNG, formatters, history projection, win handling hook, and `/game` seed wiring—**required before user story UI**.

**⚠️ CRITICAL**: No user story implementation until foundational tasks complete.

- [x] T002 [P] Add deterministic seeded RNG `createSeededRandom(seed: string): () => number` in `src/game/seededRng.ts` with Vitest in `src/game/seededRng.spec.ts`
- [x] T003 [P] Add debrief format helpers (`MM:SS` from ms, local `YYYY-MM-DD` from ISO, difficulty labels) in `src/game/winDebriefFormat.ts` with Vitest in `src/game/winDebriefFormat.spec.ts`
- [x] T004 [P] Add `filterWonSessionsNewestFirst` (or equivalent) in `src/game/winDebriefHistory.ts` with Vitest in `src/game/winDebriefHistory.spec.ts` per [`data-model.md`](./data-model.md)
- [x] T005 Wire optional deal seed into `src/views/GameView.vue`: read `useRoute().query.seed` (Playwright) and/or integrate existing `briefcase-seed-input` from `src/components/briefcase/BriefcaseView.vue` so `play.startNewRound(buildGridCells(...), rng)` uses `createSeededRandom` when a seed is present, else `Math.random`
- [x] T006 Update `src/components/GameCanvasShell.vue` so on win: `session.finalizeSession('won')`, `session.flushSave`, **emit** a `won` event (or equivalent callback prop); **remove** immediate `session.beginSession` and `play.startNewRound` from that branch

**Checkpoint**: Seeded deals reproducible; win no longer auto-starts a new round.

---

## Phase 3: User Story 1 — See completion summary and play again (Priority: P1) 🎯 MVP

**Goal**: After win on **`/game`**, URL unchanged, board replaced by debrief with **time**, **moves**, liquid-glass stats, **Play Again** (same difficulty, new random deal). **FR-001–FR-003**, **FR-010–FR-011** (stats glass + gold/grain baseline). **FR-013**: full **reload** on **`/game`** while debrief is visible must show **board + new game** (Play Again–equivalent), not debrief (**US1** scenario 4, **SC-006**).

**Independent Test**: Seeded full playthrough → debrief visible with correct summary → Play Again returns to board with new deal; **reload on debrief** → board + canvas, debrief hidden.

### Tests for User Story 1 (mandatory) ⚠️

> Write these tests **first**; they MUST **fail** before implementation.

- [x] T007 [P] [US1] Add failing-first Vitest for `src/components/WinDebriefPanel.vue` in `src/components/WinDebriefPanel.spec.ts` (summary props / store mocks, `data-testid` contract keys `win-summary-time`, `win-summary-moves`, `win-play-again`)
- [x] T008 [P] [US1] Add failing-first Playwright `e2e/win-game-screen.spec.ts`: navigate to `/game` with **easy** difficulty + fixed **`?seed=`**, complete game to win using known pair clicks, assert URL stays `/game`, `win-debrief-root`, `win-summary-time`, `win-summary-moves` (**FR-012**)
- [x] T021 [P] [US1] Extend failing-first Playwright `e2e/win-game-screen.spec.ts`: after debrief is visible, call `page.reload()`, assert URL still matches `/game`, `win-debrief-root` is **hidden**, and `game-canvas` is **visible** (**FR-013**, **SC-006**)

### Implementation for User Story 1

- [x] T009 [US1] Create `src/components/WinDebriefPanel.vue` with Stitch-aligned copy (**Post-Match Debrief**, **Operation Complete**), gold ambient + grain overlay + liquid-glass stat cards, and normative `data-testid`s from [`contracts/README.md`](./contracts/README.md)
- [x] T010 [US1] Update `src/views/GameView.vue` to toggle **board** (`GameCanvasShell`) vs **`WinDebriefPanel`** when session is **`won`**; handle `GameCanvasShell` **won** emit; guard against orphan debrief per [`spec.md`](./spec.md) edge cases
- [x] T011 [US1] Implement **Play Again** in `WinDebriefPanel.vue` (emit or injected handlers): `session.beginSession(priorDifficulty)`, return to board, `play.startNewRound(..., Math.random)` for **new random** deal (**FR-003**)
- [x] T012 [US1] Green: `pnpm test` (Vitest including `WinDebriefPanel.spec.ts`) and Playwright US1 path in `e2e/win-game-screen.spec.ts`
- [x] T027 [US1] **N/A (closed):** Reload-on-debrief covered by **T021** + `src/game/reloadNewGameDifficulty.ts` + `GameCanvasShell` `initRoundIfNeeded()`; regression checklist is [`research.md`](./research.md) §2 / §9

**Checkpoint**: MVP debrief + Play Again + seeded e2e win path green; reload-on-debrief matches **FR-013**.

---

## Phase 4: User Story 2 — Review local history ledger (Priority: P2)

**Goal**: **History Ledger** with **Date**, **Difficulty**, **Time**, **Moves**; **won** rows only; newest first; empty state (**FR-004–FR-008**).

**Independent Test**: After wins, debrief table shows correct columns, chips, ordering; empty state when no **won** rows.

### Tests for User Story 2 (mandatory) ⚠️

- [x] T013 [P] [US2] Extend Vitest in `src/components/WinDebriefPanel.spec.ts` or `src/game/winDebriefHistory.spec.ts` with fixture `CompletedSessionRecord[]` for multi-row ordering and column projection
- [x] T014 [P] [US2] Extend `e2e/win-game-screen.spec.ts`: assert `win-history-table` headers (**Date**, **Difficulty**, **Time**, **Moves**), at least one data row after win, and `win-history-empty` when appropriate (e.g. cleared **`memo-game.v1.completedSessions`** + first win)

### Implementation for User Story 2

- [x] T015 [US2] Implement ledger table + difficulty chips + **Local Data** hint in `src/components/WinDebriefPanel.vue` using `useGameSessionStore().readCompletedList()` + `filterWonSessionsNewestFirst` + formatters
- [x] T016 [US2] Add responsive horizontal scroll (or equivalent) so all four columns stay usable on narrow viewports per [`spec.md`](./spec.md) edge cases

**Checkpoint**: US1 + US2 both testable independently.

---

## Phase 5: User Story 3 — Return to briefcase hub (Priority: P3)

**Goal**: **Return to Briefcase** from debrief without starting **Play Again** in the same gesture (**FR-009**). **FR-014**: **any** navigation that lands on **`/briefcase`** clears **win debrief presentation state**; next **`/game`** visit must **not** show debrief until a **new** win (**US3** scenario 2, **SC-006**). **Implementation note:** Pinia survives route changes—clear **`won`** session **and** reset `play.memory` when dismissing debrief for hub navigation so `GameCanvasShell` `initRoundIfNeeded()` does not keep a stale completed board.

**Independent Test**: From debrief, **`page.goto('/briefcase')`** (not only Return button) then open **`/game`** — debrief hidden, canvas visible until a new win.

### Tests for User Story 3 (mandatory) ⚠️

- [x] T017 [P] [US3] Extend failing-first `e2e/win-game-screen.spec.ts`: after win, click `win-return-briefcase`, expect navigation to **`/briefcase`**
- [x] T022 [P] [US3] Extend failing-first `e2e/win-game-screen.spec.ts`: after debrief visible, navigate with `page.goto('/briefcase')` (simulate hub entry without Return), then `page.goto('/game?difficulty=easy&seed=e2e-memo-win')`, assert `win-debrief-root` is **not** visible and `game-canvas` **is** visible (**FR-014**, **SC-006**)
- [x] T023 [P] [US3] Vitest regression in `src/stores/gameSession.spec.ts`: after `finalizeSession('won')`, `clearSession()` leaves `gameSession` **null**, **`memo-game.v1.completedSessions` length unchanged**, and last row remains **`outcome === 'won'`** (hub dismiss must not delete history — **FR-014**)

### Implementation for User Story 3

- [x] T018 [US3] Add **Return to Briefcase** control with `data-testid="win-return-briefcase"` in `src/components/WinDebriefPanel.vue`, `router.push({ name: 'briefcase' })`, and session cleanup per [`research.md`](./research.md) §8 / [`data-model.md`](./data-model.md)
- [x] T024 [US3] Register `router.beforeEach` in `src/router/index.ts` so when navigation **commits** to **`briefcase`** and `useGameSessionStore().gameSession?.status === 'won'`, call `session.clearSession()` and `useGamePlayStore().resetRound()` per [`research.md`](./research.md) §9
- [x] T025 [US3] Update `onReturnBriefcase` in `src/views/GameView.vue` to call `play.resetRound()` after `session.clearSession()` so Return matches router guard behavior (**FR-014**)
- [x] T028 [US3] Fix misleading comment in `src/composables/useBriefcaseNavigateToGame.ts` that cites **FR-014** for difficulty-mismatch abandon (reference correct requirement or neutral wording)

**Checkpoint**: US3 + **FR-014** covered; **T022** green.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Visual parity, docs, quality gates.

- [x] T019 [P] Refine debrief styling (radial gold, noise opacity, glass ledger container) against `designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/inspection_summary_history/code.html` in `src/components/WinDebriefPanel.vue`
- [x] T020 Run manual validation per [`quickstart.md`](./quickstart.md); run `pnpm run lint`, `pnpm test`, and `pnpm test:e2e:preview` at repo root

### Post-clarify polish (FR-013 / FR-014 completion)

- [x] T026 Run `pnpm run lint`, `pnpm test`, and `pnpm test:e2e:preview` after **T021–T025** land; confirm [`quickstart.md`](./quickstart.md) steps 3–4 still match behavior

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3 (US1)** → **Phase 4 (US2)** → **Phase 5 (US3)** → **Phase 6**
- **FR-013 / FR-014 slice**: Write **T021**, **T022**, **T023** first (red), then **T024**, **T025**, **T028**, **T026** (**T027** = closed N/A checklist item)

### User Story Dependencies

| Story | Depends on |
|-------|------------|
| US1 | Phase 2 only |
| US2 | US1 (ledger lives on debrief panel) |
| US3 | US1 (return control on debrief panel) |

### Within FR-013 / FR-014 work

- **T021** (reload e2e) can run in parallel with **T022** (briefcase e2e) and **T023** (Vitest) once Phase 3 baseline exists
- **T024** depends on **T023** green (or concurrent if tests specify behavior first)
- **T025** should land with or immediately after **T024**
- **T027** marked N/A; use [`research.md`](./research.md) §2 / §9 if reload-on-debrief regresses

### Parallel Opportunities

- **Phase 2:** T002, T003, T004 together after T001
- **US1 tests:** T007, T008 together after Phase 2
- **FR-013/14 tests:** T021, T022, T023 in parallel after T012 baseline
- **US2 tests:** T013 and T014 together
- **US3 test:** T017 after US1 path works; T022 after T017 pattern exists

### Parallel Example: FR-013 / FR-014

```bash
# After core 006 is green (T012), in parallel:
# Playwright reload: e2e/win-game-screen.spec.ts (T021)
# Playwright briefcase→game: e2e/win-game-screen.spec.ts (T022)
# Vitest: src/stores/gameSession.spec.ts (T023)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. T001  
2. Phase 2 (T002–T006)  
3. Phase 3 through T012 — **STOP** and demo seeded win → debrief  

### Incremental Delivery

1. Add US2 (T013–T016) → ledger + ordering tests  
2. Add US3 (T017–T018) → hub navigation  
3. Phase 6 polish (T019–T020)  
4. **Spec clarify 2026-04-08:** complete **T021–T028**, **T026** for **FR-013**, **FR-014**, **SC-006**

### Parallel Team Strategy

After Phase 2, one developer can own **T021–T023** while another prepares **T024–T025** once test expectations are agreed.

---

## Notes

- Do **not** add a **`/win`** route; debrief is **`/game`** UI mode only ([`spec.md`](./spec.md) clarifications).
- **Moves** displayed = **`clickCount`** from `CompletedSessionRecord` / `GameSession`.
- **Playwright** must use **full `/game` → win → debrief** flow (**FR-012**), not mounting debrief in isolation.
- **FR-014** applies to **every** navigation that lands on **`/briefcase`**, not only **Return to Briefcase** ([`contracts/README.md`](./contracts/README.md)).

---

## Task summary

| Phase | Total | Open |
|-------|------:|-----:|
| Phase 1 | 1 | 0 |
| Phase 2 | 5 | 0 |
| Phase 3 (US1) | 8 | 0 |
| Phase 4 (US2) | 4 | 0 |
| Phase 5 (US3) | 7 | 0 |
| Phase 6 | 3 | 0 |
| **Total** | **28** | **0** |

**Open tasks:** none (006 task list complete).
