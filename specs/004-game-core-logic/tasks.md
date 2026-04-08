---
description: "Task list for feature 004 — Game Core Logic"
---

# Tasks: Game Core Logic

**Input**: Design documents from `/specs/004-game-core-logic/`  
**Prerequisites**: [`plan.md`](./plan.md), [`spec.md`](./spec.md), [`data-model.md`](./data-model.md), [`research.md`](./research.md), [`contracts/`](./contracts/), [`quickstart.md`](./quickstart.md)

**Tests (mandatory for this repository)**: Every user story includes failing-first **Vitest** and **Playwright** tasks per `.specify/memory/constitution.md`. Initial Playwright scope is **single-tile (minimal)** per [`spec.md`](./spec.md) clarifications (2026-04-07).

**Organization**: Phases follow user story priority P1 → P2 → P3 after shared foundation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no ordering dependency on sibling [P] tasks)
- **[Story]**: `[US1]` / `[US2]` / `[US3]` for user-story phases only
- Descriptions include **concrete file paths**

## Path Conventions

Single repo: root `package.json`; implementation under `src/`; Vitest as `src/**/*.spec.ts`; Playwright under `e2e/` per [`plan.md`](./plan.md).

---

## Phase 1: Setup (shared)

**Purpose**: Align constants and types with contracts/data-model before engine work.

- [x] T001 Add `src/game/sessionConstants.ts` exporting `localStorage` key strings matching `specs/004-game-core-logic/contracts/README.md` (`memo-game.v1.inProgress`, `memo-game.v1.completedSessions`)
- [x] T002 [P] Add `src/game/memoryTypes.ts` with TypeScript types for `TileRuntimeState`, `PairResolutionState`, `GameSession`, `SessionSnapshot`, and `CompletedSessionRecord` per `specs/004-game-core-logic/data-model.md`

---

## Phase 2: Foundational (blocking)

**Purpose**: Canvas geometry and hit testing shared by all user stories. **No user story phase may start until this phase completes.**

- [x] T003 Add `src/game/canvasHitTest.ts` exporting `cellIndexFromPointer(canvas, clientX, clientY, rows, cols)` (DPR-safe) for use by `src/components/GameCanvasShell.vue`
- [x] T004 [P] Add `src/game/cellRect.ts` exporting per-cell layout rects (x, y, w, h) from canvas CSS size, `rows`, `cols`, and gap for consistent paint and hit testing, consumed by `src/components/GameCanvasShell.vue`

**Checkpoint**: Foundation ready — user story work may begin.

---

## Phase 3: User Story 1 — Classical memory round (Priority: P1) — MVP

**Goal**: Concealed tiles, two-at-a-time reveal, matching pair removed from play, mismatch re-conceal after resolution, input locked per FR-002 — all on canvas.

**Independent Test**: `pnpm test` passes `src/game/memoryEngine.spec.ts`; `pnpm test:e2e:preview` passes `e2e/game-core-playthrough.spec.ts` (single-tile / minimal assertions).

### Tests for User Story 1 (mandatory)

> Write **first**; they MUST fail before implementation lands.

- [x] T005 [P] [US1] Add failing Vitest `src/game/memoryEngine.spec.ts` covering select, lock, match → `matched`, mismatch → concealed, win detection, and **no corrupt state / no extra “pick” when rapidly tapping an already-revealed tile** per `specs/004-game-core-logic/spec.md` User Story 1 / FR-001–FR-002 / Edge Cases
- [x] T006 [P] [US1] Add failing Playwright `e2e/game-core-playthrough.spec.ts` mapped to User Story 1 scenarios (single-tile or minimal surface per clarifications)

### Implementation for User Story 1

- [x] T007 [US1] Implement pure transition helpers in `src/game/memoryEngine.ts` until `src/game/memoryEngine.spec.ts` passes
- [x] T008 [US1] Add Pinia store `src/stores/gamePlay.ts` holding board cells + `PairResolutionState` and delegating to `src/game/memoryEngine.ts` for `src/components/GameCanvasShell.vue`
- [x] T009 [US1] Wire pointer/touch handlers in `src/components/GameCanvasShell.vue` to `src/game/canvasHitTest.ts` and `src/stores/gamePlay.ts` (pick → state update → repaint)
- [x] T010 [US1] Implement canvas paint path for concealed vs revealed vs matched (no face draw for matched) in `src/components/GameCanvasShell.vue` or extracted `src/game/canvasTileDraw.ts`
- [x] T011 [US1] Add timed mismatch resolution (delay before re-conceal) in `src/stores/gamePlay.ts` or `src/game/memoryEngine.ts` without breaking lock rules; keep `pnpm test` and `e2e/game-core-playthrough.spec.ts` green

**Checkpoint**: User Story 1 complete and independently verifiable.

---

## Phase 4: User Story 2 — Responsive board, spacing, motion (Priority: P2)

**Goal**: ~1200px content target on desktop, container-based tile size, padding between tiles, left-pivot concealed presentation, parallax from pointer/touch with reduced-motion support.

**Independent Test**: Vitest layout math; Playwright `e2e/game-core-layout-motion.spec.ts` on viewport + meta/single cell.

### Tests for User Story 2 (mandatory)

- [x] T012 [P] [US2] Add failing Vitest `src/game/canvasLayout.spec.ts` for gap + cell dimensions vs container width and row/col counts
- [x] T013 [P] [US2] Add failing Playwright `e2e/game-core-layout-motion.spec.ts` for layout meta / single-tile motion or reduced-motion hook (per spec scope)

### Implementation for User Story 2

- [x] T014 [US2] Update board shell width in `src/components/GameCanvasShell.vue` and `src/views/GameView.vue` toward ~1200px max content per FR-003 (replace overly narrow `max-w-md` where applicable)
- [x] T015 [P] [US2] Centralize responsive cell + gap calculation in `src/game/canvasLayout.ts` and use in `src/components/GameCanvasShell.vue` paint path
- [x] T016 [US2] Implement initial concealed draw + left-pivot flip animation for reveal/mismatch per FR-005 in `src/game/canvasTileDraw.ts` (or inline `GameCanvasShell.vue` if kept small)
- [x] T017 [P] [US2] Add `src/game/tileParallax.ts` and integrate pointer/touch parallax offsets in `src/components/GameCanvasShell.vue` with `prefers-reduced-motion` per spec Edge Cases
- [x] T018 [US2] Make `src/game/canvasLayout.spec.ts` and `e2e/game-core-layout-motion.spec.ts` pass

**Checkpoint**: User Stories 1 and 2 both pass their tests.

---

## Phase 5: User Story 3 — Session metrics, active time, restore (Priority: P3)

**Goal**: **Tile click counts** (for stats), difficulty, active-tab-only time; persist in-progress snapshot and **completed** history (**`won`** and **`abandoned`**) to `localStorage`; restore after reload (including difficulty parity); English error when storage fails.

**Independent Test**: `src/stores/gameSession.spec.ts`; `e2e/game-core-session-persistence.spec.ts` (minimal restore).

### Tests for User Story 3 (mandatory)

- [x] T019 [P] [US3] Add failing Vitest `src/stores/gameSession.spec.ts` for visibility/focus gating of active time, snapshot JSON round-trip vs `specs/004-game-core-logic/contracts/session-storage.schema.json` (including **tile `clickCount`** for stats), completed-history cap behavior, **abandon → `outcome: abandoned`** record append + in-progress clear, and **repeated restore trials** (e.g. ≥20 serialize/hydrate loops) to support **SC-004** pass rate in CI
- [x] T020 [P] [US3] Add failing Playwright `e2e/game-core-session-persistence.spec.ts` for reload restore or storage shim (minimal smoke per clarifications; **SC-004** bulk evidence lives in T019)

### Implementation for User Story 3

- [x] T021 [P] [US3] Implement `src/stores/gameSession.ts` with `GameSession` metrics (**tile `clickCount` persisted for future statistics**), coordination hooks for `src/stores/gameSettings.ts` difficulty (FR-007, FR-008)
- [x] T022 [US3] Add `src/composables/useActivePlayTime.ts` and wire `activePlayMs` increments only when tab visible and document focused (FR-009) into `src/stores/gameSession.ts`
- [x] T023 [US3] Persist `SessionSnapshot` to `localStorage` via keys in `src/game/sessionConstants.ts` from `src/stores/gameSession.ts` (debounced saves; FR-010)
- [x] T024 [US3] Hydrate `src/stores/gamePlay.ts` + `src/stores/gameSession.ts` from stored snapshot on game route entry in `src/views/GameView.vue` (or store `hydrateFromStorage()` in `src/stores/gameSession.ts`)
- [x] T025 [US3] On **win** or confirmed **Abandon game**, append `CompletedSessionRecord` (must include **clickCount**, difficulty, active play time, **outcome** `won` | `abandoned`, ordering timestamp/id) to `memo-game.v1.completedSessions` and clear in-progress key in `src/stores/gameSession.ts` (FR-011)
- [x] T031 [US3] Add **Abandon game** control (English) at **top-left** of the game layout in `src/views/GameView.vue` (or `src/components/` wrapper used only on `/game`), wired to `src/stores/gameSession.ts` / `gamePlay` reset per FR-012; optional confirm dialog SHOULD match spec Edge Cases without incrementing **clickCount** for merely opening the dialog
- [x] T026 [US3] Show English-only storage/quota failure copy from `src/views/GameView.vue` or small UI helper under `src/components/` when persistence errors occur
- [x] T027 [US3] Increment **`clickCount` once per accepted tile pick** (ignored picks while locked do not increment) in `src/stores/gameSession.ts` integrated with `src/stores/gamePlay.ts` so totals match FR-007 / FR-011 statistics needs; keep Vitest + Playwright US3 specs green

**Checkpoint**: All three user stories independently testable and green.

---

## Phase 6: Polish & cross-cutting

**Purpose**: Lint, legacy e2e alignment, quickstart validation.

- [x] T028 [P] Run `pnpm run lint` and fix any issues introduced under `src/` and `e2e/`
- [x] T029 [P] Update `e2e/csgo-tile-library-game.spec.ts` if `data-testid` or canvas behavior changes break existing flow
- [x] T030 Execute validation steps in `specs/004-game-core-logic/quickstart.md` from repo root (`pnpm test`, `pnpm run build`, `pnpm test:e2e:preview`)

### Analysis remediation (spec + implementation alignment)

- [x] T032 Document and enforce **FR-013**: map `identityIndex` → `TileEntry` using **`n` from the active board** (`cells.length / 2` when memory loaded) in `src/components/GameCanvasShell.vue` (subset entry); keep paint and hit-test on the same `rows`/`cols` as `gamePlay`.
- [x] T033 Document and enforce **restore/difficulty parity**: hydrate applies `session.difficulty` to `useGameSettingsStore` and avoids spurious “new round” from the difficulty watcher (`GameCanvasShell` `initRoundIfNeeded` + `prevDifficulty`); start a new deal when `cells.length` ≠ current layout after navigation.
- [x] T034 **FR-014** The Briefcase: difficulty radios do **not** prompt; **`useBriefcaseNavigateToGame`** (Unlock + Briefcase **Play**) confirms when `in_progress` and selected difficulty ≠ `GameSession.difficulty`; English copy `briefcaseUnlockAbandonDifferentDifficulty`; Vitest in `BriefcaseView.spec.ts`; no reactive difficulty watcher on `GameCanvasShell`.
- [x] T035 Update `specs/004-game-core-logic/spec.md`, `data-model.md`, `contracts/README.md`, `quickstart.md`, `plan.md`, and this `tasks.md` to reflect T032–T034 and corrected US3 wording.

---

## Dependencies & execution order

### Phase dependencies

| Phase | Depends on | Notes |
|--------|------------|--------|
| 1 Setup | — | Start immediately |
| 2 Foundational | Phase 1 | **Blocks** all user stories |
| 3 US1 | Phase 2 | MVP |
| 4 US2 | Phase 2, US1 recommended | Layout builds on working board; do not break US1 tests |
| 5 US3 | Phase 2, US1 | Metrics attach to play loop; may start after US1 store exists |
| 6 Polish | US1–US3 as needed | Run when feature scope complete |

### User story dependencies

- **US1**: After Phase 2 only.
- **US2**: After Phase 2; practically after US1 canvas/store integration.
- **US3**: After Phase 2; after US1 `gamePlay` + canvas picks exist for click counting and snapshot shape.

### Within each user story

1. Vitest + Playwright tasks **T005–T006** (US1), **T012–T013** (US2), **T019–T020** (US3) — fail first.  
2. Pure logic / stores before more Vue glue.  
3. Canvas integration before polish.  
4. Story “green” checkpoint before treating the next priority as done.

### Parallel opportunities

- **Phase 1**: T001 and T002 in parallel.
- **Phase 2**: T003 and T004 in parallel.
- **Per story**: paired `[P]` test tasks; `[P]` impl tasks where listed (different files).
- **Cross-story**: Not recommended until US1 MVP is green (reduces integration risk).

---

## Parallel example: User Story 1

```bash
# Together after Phase 2:
# - T005 [US1] src/game/memoryEngine.spec.ts
# - T006 [US1] e2e/game-core-playthrough.spec.ts

# Parallel implementation splits (after tests exist):
# - T007 src/game/memoryEngine.ts
# - T008 src/stores/gamePlay.ts  (sequential after T007 if store calls engine)
```

---

## Implementation strategy

### MVP first (User Story 1 only)

1. Complete Phase 1–2.  
2. Complete Phase 3 (US1).  
3. Stop and demo: classical play on canvas with tests green.

### Incremental delivery

1. Foundation (Phases 1–2) → US1 → US2 → US3 → Polish.  
2. Each phase keeps prior Vitest/Playwright suites passing.

### Suggested task counts

| Area | Count |
|------|-------|
| Setup | 2 |
| Foundational | 2 |
| US1 | 7 |
| US2 | 7 |
| US3 | 10 |
| Polish | 3 |
| Analysis remediation | 4 |
| **Total** | **35** |

---

## Notes

- `[P]` = safe parallel with other `[P]` tasks in the same phase when files differ.  
- `[US#]` only on Phases 3–5.  
- Prefer **red → green → refactor** for every new behavior.  
- `tasks.md` path: `/Users/kacperthecat/memo game/memo-game/specs/004-game-core-logic/tasks.md`
