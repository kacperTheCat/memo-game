---
description: "Task list for 011-game-sound-effects"
---

# Tasks: Game sound effects (011)

**Input**: Design documents from `/specs/011-game-sound-effects/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/sound-cues.md](./contracts/sound-cues.md)

**Tests (mandatory for this repository)**: Every user story includes failing-first **Vitest** and **Playwright** tasks per `.specify/memory/constitution.md`.

**Organization**: Tasks are grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label ([US1], [US2]) on story-phase tasks only
- Paths are relative to repository root unless noted

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm assets and scope before implementation

- [x] T001 Verify bundled audio files exist: `public/audio/click.mp3`, `flip.mp3`, `success.mp3`, `fail.mp3`, `terrorist-wins.mp3`, `counter-terrorists-win.mp3` per [plan.md](./plan.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared **`playSfx`** API (Web Audio + `<audio>` fallback), resume-on-gesture, never throw — **required before US1 and US2**

**⚠️ CRITICAL**: No user story work until this phase completes

- [x] T002 [P] Add failing Vitest `src/audio/gameSfx.spec.ts` for public URL building (`import.meta.env.BASE_URL`), `winRandom` selection with mocked `Math.random`, and safe behavior when `AudioContext` / decode is unavailable (mocks)
- [x] T003 Implement `src/audio/gameSfx.ts` exporting `playSfx(cue)` and gesture unlock (`ensureSfxAudioUnlocked` or equivalent) per [contracts/sound-cues.md](./contracts/sound-cues.md) and [research.md](./research.md) until `src/audio/gameSfx.spec.ts` passes

**Checkpoint**: `pnpm test` includes green `gameSfx` unit tests; gameplay not wired yet

---

## Phase 3: User Story 1 — Gameplay audio feedback (Priority: P1) 🎯 MVP

**Goal**: Flip, mismatch fail, match success, and random win sting on `/game` per [spec.md](./spec.md) FR-001–004, FR-008

**Independent Test**: Play easy round with audio on — hear flip, fail, success, win; muted/blocked — no errors ([quickstart.md](./quickstart.md))

### Tests for User Story 1 (mandatory) ⚠️

> Write these tests **first**; they MUST **fail** before implementation lands

- [x] T004 [P] [US1] Add failing Vitest `src/game/sfxPickOutcomes.spec.ts` for pure helpers that derive **flip** / **success** flags from pre/post `MemoryState` and picked index (types from `src/game/memoryTypes.ts` / `memoryEngine.ts`)
- [x] T005 [P] [US1] Add failing Playwright `e2e/game-sound-effects.spec.ts` exercising gameplay flow (tile picks, mismatch, match, win) with **no console errors**; map to spec acceptance scenarios 1–4 (optional `window.__MEMO_SFX` hook only if needed per [contracts/sound-cues.md](./contracts/sound-cues.md))

### Implementation for User Story 1

- [x] T006 [US1] Add `src/game/sfxPickOutcomes.ts` implementing pick-outcome logic tested in T004
- [x] T007 [US1] Wire `playSfx('flip'|'success'|'winRandom')` and `ensureSfxAudioUnlocked` in `src/components/GameCanvasShell.vue` (`onCanvasPick` / `tryPick` path) with **exactly one** `winRandom` per `won: true` per contract
- [x] T008 [US1] Wire `playSfx('fail')` in `src/stores/gamePlay.ts` inside mismatch `setTimeout` **after** `clearMismatch` applies (tiles concealed again), matching [research.md](./research.md) §5
- [x] T009 [US1] Re-run `pnpm test` and `e2e/game-sound-effects.spec.ts`; fix until green for US1 scope

**Checkpoint**: User Story 1 fully testable alone; MVP demo = P1 complete

---

## Phase 4: User Story 2 — Consistent button clicks (Priority: P2)

**Goal**: Short click on every primary button activation via shared primitives per [spec.md](./spec.md) FR-005

**Independent Test**: Navigate home, briefcase, game, dialogs — hear click on each activation (audio on)

### Tests for User Story 2 (mandatory) ⚠️

- [x] T010 [P] [US2] Extend failing-first `src/components/ui/AppButton.spec.ts` to assert `playSfx('click')` (or shared helper) runs on **button** click and **RouterLink** click (mock `@/audio/gameSfx` or inject test double)
- [x] T011 [P] [US2] Extend `e2e/game-sound-effects.spec.ts` for primary chrome buttons (e.g. briefcase entry, nav back, confirm/cancel) — **no console errors**; maps to acceptance scenario 5

### Implementation for User Story 2

- [x] T012 [US2] Wire `playSfx('click')` + unlock on user activation in `src/components/ui/AppButton.vue` (native `<button>` and `<RouterLink>`)
- [x] T013 [US2] Wire `playSfx('click')` in `src/components/ui/MemoSecondaryNavButton.vue` for both button and link variants
- [x] T014 [US2] Audit and wire shared UI click sound for remaining primary actions in `src/components/ui/MemoConfirmDialog.vue`, `src/components/WinDebriefPanel.vue`, `src/components/briefcase/BriefcaseView.vue`, and any non-`AppButton` control buttons in `src/components/GameCanvasShell.vue` (e.g. dev peek) per [plan.md](./plan.md) implementation notes
- [x] T015 [US2] Confirm Vitest + Playwright green for US2 scope

**Checkpoint**: US1 and US2 both pass tests independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Repo-wide validation and consistency

- [x] T016 Run `pnpm run lint` and full E2E `pnpm run test:e2e:preview` (or `pnpm run test:e2e` per CI parity) from repo root
- [x] T017 [P] Align [quickstart.md](./quickstart.md) with any final test command or `data-testid` notes if changed during implementation
- [x] T018 [P] **FR-005 / FR-005a** (spec clarification 2026-04-09): `HomeView` **Configure New Game** `RouterLink` + `BriefcaseView` difficulty **`@change`** → `playUiClick()`; Vitest coverage; Playwright uses **`label.memo-radio-card`** + **`filter({ has: page.locator('input…') })`** so clicks hit the card, not `sr-only` radios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3 (US1)** → **Phase 4 (US2)** → **Phase 5**
- **US2** depends on **Phase 2** only for `playSfx('click')`; it may proceed in parallel with **US1** after Phase 2 if staffed (shared files `gameSfx.ts` finished in Phase 2)

### User Story Dependencies

- **US1**: After Phase 2; no dependency on US2
- **US2**: After Phase 2; integrates with same `gameSfx` module; avoid conflicting edits on `AppButton.vue` / e2e file if parallelizing — prefer sequential **US1 → US2** for single developer

### Within Each User Story

- Vitest (T004/T010) and Playwright (T005/T011) written and failing before integration tasks
- Pure helpers before Vue/store glue
- Story complete when listed test tasks green

### Parallel Opportunities

- **Phase 2**: T002 ∥ (prepare mocks only) — T003 follows T002
- **US1**: T004 ∥ T005; then T006 → T007, T008 → T009
- **US2**: T010 ∥ T011; then T012 → T013 → T014 → T015
- **Phase 5**: T017 ∥ T018 ∥ (after T016)

---

## Parallel Example: User Story 1

```bash
# Together after Phase 2:
# - Implement/strengthen src/game/sfxPickOutcomes.spec.ts (T004)
# - Scaffold e2e/game-sound-effects.spec.ts (T005)
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 → Phase 2 → Phase 3 (through T009)  
2. Stop and validate gameplay SFX independently

### Incremental Delivery

1. Add Phase 4 (US2) for full FR-005 coverage  
2. Phase 5 for lint + full E2E

---

## Notes

- `tasks.md` is created by `/speckit.tasks`; **Phase 2** is the shared audio foundation — do not skip T002–T003  
- Win sound **once** per round: only `GameCanvasShell` `won` path (avoid duplicate from `GameView` watchers) per [contracts/sound-cues.md](./contracts/sound-cues.md)  
- Mark each task `[X]` in this file as work completes (`/speckit.implement`)
