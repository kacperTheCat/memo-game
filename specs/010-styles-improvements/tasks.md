# Tasks: Styles improvements — ambient visuals (010)

**Input**: Design documents from `/specs/010-styles-improvements/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ambient-ui.md](./contracts/ambient-ui.md), [quickstart.md](./quickstart.md)

**Tests (mandatory)**: Failing-first **Vitest** and **Playwright** per `.specify/memory/constitution.md` and [spec.md](./spec.md).

**Format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`

**Status:** **T001–T037** — **done** in repo (includes US1 remediation: **fixed viewport** spotlight, **~420 ms** fade-in, **`data-memo-spotlight-vp-*`**, **FR-001c** wind-shaped cloud, docs sync).

**Traceability**: Spec US4 names “Briefcase” for **Operation Complete**; implementation lives in `WinDebriefPanel.vue` per [plan.md](./plan.md).

---

## Phase 1: Setup (shared)

**Purpose**: Confirm context before implementation.

- [x] T001 Confirm git branch `010-styles-improvements` and read `specs/010-styles-improvements/plan.md`, `spec.md`, `research.md`, `data-model.md`, and `contracts/ambient-ui.md`

---

## Phase 2: Foundational (blocking)

**Purpose**: Shared **smoothed pointer → centroid** math and chase-light composable including **visibility envelope** (**FR-001a**, **FR-001b**). **No user story work until this phase completes.**

- [x] T002 [P] Add or verify `src/game/ambientPointerMath.ts` (`lerp2d`, `springToward2d`, `clampPointToRect`, drift/noise) + Vitest `src/game/ambientPointerMath.spec.ts`
- [x] T003 Add or extend `src/composables/useAmbientChaseLight.ts` — Pointer Events idle/touch envelope, rAF, `prefers-reduced-motion`, **`data-ambient-spotlight-active`** inputs + Vitest `src/composables/useAmbientChaseLight.spec.ts`

---

## Phase 3: User Story 1 — Cursor spotlight behind content (Priority: P1) 🎯 MVP

**Goal**: Cloud-chasing spotlight; **FR-002** z-order; **SC-007** / **SC-008** idle + touch.

### Tests for User Story 1 (mandatory)

- [x] T004 [P] [US1] Playwright `e2e/styles-spotlight-depth.spec.ts` — presence, z-order, **`data-ambient-spotlight-active`** idle cycle
- [x] T005 [P] [US1] Vitest `src/components/ambient/MemoAmbientSpotlight.spec.ts` — mounts, active/opacity, reduced motion

### Implementation for User Story 1

- [x] T006 [US1] `src/components/ambient/MemoAmbientSpotlight.vue` — radial glow, `data-testid`, **`data-ambient-spotlight-active`**
- [x] T007 [US1] Mount in `src/views/HomeView.vue`
- [x] T008 [US1] Mount in `src/views/BriefcaseViewPage.vue` backdrop
- [x] T009 [US1] Mount in `src/components/WinDebriefPanel.vue`
- [x] T010 [US1] Verify `pnpm test` + `e2e/styles-spotlight-depth.spec.ts`

---

## Phase 4: User Story 2 — Game card gradient (Priority: P1)

- [x] T011 [P] [US2] Vitest `src/game/tileFaceGradientPointer.spec.ts`
- [x] T012 [P] [US2] Playwright `e2e/styles-game-card-gradient.spec.ts`
- [x] T013 [US2] `src/game/canvasTileDraw.ts` — revealed-face gradient
- [x] T014 [US2] `src/components/GameCanvasShell.vue` — lerp focal params
- [x] T015 [US2] Verify Vitest + Playwright for US2

---

## Phase 5: User Story 3 — Briefcase yellow ambience (Priority: P2)

- [x] T016 [P] [US3] Vitest `src/game/briefcaseAmbienceTargets.spec.ts`
- [x] T017 [P] [US3] Playwright `e2e/styles-briefcase-ambience.spec.ts`
- [x] T018 [US3] `src/views/BriefcaseViewPage.vue` — rAF blobs
- [x] T019 [US3] Verify Vitest + Playwright for US3

---

## Phase 6: User Story 4 — Operation Complete (Priority: P2)

- [x] T020 [P] [US4] Vitest `src/components/WinDebriefPanel.operationComplete.spec.ts`
- [x] T021 [P] [US4] Playwright `e2e/styles-operation-complete-text.spec.ts`
- [x] T022 [US4] `src/components/WinDebriefPanel.vue` — stagger + per-glyph gradient (no parent clip vanish)
- [x] T023 [US4] Verify Vitest + Playwright for US4

---

## Phase 7: User Story 5 — Grain motion (Priority: P3)

- [x] T024 [P] [US5] Vitest `src/components/layout/HubGrainLayer.spec.ts`
- [x] T025 [P] [US5] Playwright `e2e/styles-grain-motion.spec.ts`
- [x] T026 [US5] `src/components/layout/HubGrainLayer.vue` — motion + reduced motion
- [x] T027 [US5] Verify Vitest + Playwright for US5

---

## Phase 8: Polish & cross-cutting

- [x] T028 [P] Run `pnpm test` and `pnpm lint`; fix regressions
- [x] T029 Manual validation per `quickstart.md`
- [x] T030 [P] Run `.specify/scripts/bash/update-agent-context.sh cursor-agent` if stack diverged

---

## Phase 9: US1 remediation — viewport alignment & motion polish (Priority: P1)

**Goal**: Spotlight **centroid tracks the pointer accurately** when the page layout is **wider than the viewport** (e.g. Home + wide `SessionHistoryLedger` table): gradient `%` MUST match **viewport** pointer space (**research.md** §1: **fixed full-viewport** layer). **Gentler fade-in** (~**420 ms**). **FR-001c** velocity-aligned (“wind”) silhouette — **locked in spec** (clarification 2026-04-09).

**Independent Test**: Wide window + horizontal overflow on `/` — move mouse over table and empty areas; glow stays under cursor; fade-in feels soft.

### Tests (mandatory)

- [x] T031 [P] [US1] Extend Playwright `e2e/styles-spotlight-depth.spec.ts` — e.g. set viewport **narrow** + inject / use DOM that forces **scrollWidth > innerWidth** on Home (or stub min-width on ledger container), move mouse, assert **`data-ambient-spotlight-active`** + spot check gradient position via stable hook if added (`data-memo-spotlight-vp-x` optional on `MemoAmbientSpotlight`)
- [x] T032 [P] [US1] Vitest `src/components/ambient/MemoAmbientSpotlight.spec.ts` — with **fixed** layer + mocked dimensions, **%** position matches **clientX/Y** vs viewport (regression for I1 from analysis)

### Implementation

- [x] T033 [US1] `src/components/ambient/MemoAmbientSpotlight.vue` — use **`position: fixed; inset: 0`** (or equivalent) so layer box equals **visual viewport**; tune **z-index** with grain/backdrop so **FR-002** preserved on Home, Briefcase, Win debrief
- [x] T034 [US1] Adjust parent wrappers in `src/views/HomeView.vue`, `src/views/BriefcaseViewPage.vue`, `src/components/WinDebriefPanel.vue` if needed so **fixed** spotlight still sits **below** `z-10` (and **HubGrainLayer** ordering stays correct)
- [x] T035 [US1] `src/composables/useAmbientChaseLight.ts` — increase **`FADE_IN_MS`** to **~380–450 ms** (product pick); keep touch/mouse fade-out as-is unless plan changes
- [x] T036 [P] [US1] **Stretch:** **Ellipse / axis** of radial gradient follows **smoothed pointer velocity** (“wind”); extend composable + `MemoAmbientSpotlight.vue`; Vitest covers mount + viewport hooks (**FR-001c** in spec)

### Docs

- [x] T037 [P] Update `specs/010-styles-improvements/plan.md` §US1 and `research.md` §1–2 with **fixed viewport layer**, new **fade-in** ms, and overflow edge case; update `quickstart.md` wide-layout manual check

**Checkpoint**: T031–T037 green.

---

## Dependencies & execution order

- **Phase 1** → **2** → **3–7** → **8** → **9** (remediation can ship independently of US2–US5 regressions if scoped to US1 files only)
- **Phase 9** touches **Home / Briefcase / Win** shells + composable — batch one PR or T033–T034 together to avoid broken z-order mid-flight

### Parallel opportunities

- **T031** ∥ **T032** after T033–T034 land (or T032 against mocked component first)
- **T037** after implementation

---

## Implementation strategy

1. **Phase 9** complete — wide Home viewport alignment, fade-in, **FR-001c** wind cloud, docs synced.

---

## Task summary

| Phase | Task IDs | Count | Status |
|-------|----------|-------|--------|
| Setup | T001 | 1 | done |
| Foundational | T002–T003 | 2 | done |
| US1 | T004–T010 | 7 | done |
| US2 | T011–T015 | 5 | done |
| US3 | T016–T019 | 4 | done |
| US4 | T020–T023 | 4 | done |
| US5 | T024–T027 | 4 | done |
| Polish | T028–T030 | 3 | done |
| **US1 remediation** | **T031–T037** | **7** | **done** |
| **Total** | | **37** | |

**Parallel-friendly**: Historical — Phase 9 closed.
