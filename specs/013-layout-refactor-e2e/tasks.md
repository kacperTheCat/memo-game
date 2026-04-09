---
description: "Task list for 013 layout refactor & screen visual E2E"
---

# Tasks: Layout balance, maintainability refactor, and screen visual checks

**Input**: Design documents from `/specs/013-layout-refactor-e2e/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests (mandatory for this repository)**: Failing-first **Playwright** per user story; **Vitest** where pure logic is extracted or behavior must be locked during refactor (see US2).

**Organization**: Phases follow spec priorities P1 → P2 → P3; MVP = complete through User Story 1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no ordering dependency within the same checkpoint)
- **[Story]**: `[US1]` / `[US2]` / `[US3]` for user-story phases only

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline repo and feature docs before changes.

- [X] T001 [P] Run `pnpm test` at repo root; fix only pre-existing failures unrelated to 013 before proceeding (record baseline).
- [X] T002 [P] Read `specs/013-layout-refactor-e2e/contracts/README.md` and `specs/013-layout-refactor-e2e/quickstart.md` for seed URL, viewport, and snapshot update commands.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm E2E infrastructure accepts new specs (no feature work until this passes).

**⚠️ CRITICAL**: Complete before User Story phases.

- [X] T003 Verify `playwright.config.ts` (`testDir: 'e2e'`) and `.github/workflows/ci.yml` will pick up new specs without workflow edits; document in PR if an exception is required.

**Checkpoint**: Foundation ready — proceed to US1.

---

## Phase 3: User Story 1 — Balanced game layout (Priority: P1) 🎯 MVP

**Goal**: Canvas/play area not biased to the right on desktop; usable on mobile without horizontal scroll (spec scenarios 1–3).

**Independent Test**: `pnpm exec playwright test e2e/game-layout-balance.spec.ts` passes.

### Tests for User Story 1 (mandatory) ⚠️

> Write these first; they MUST fail before layout changes.

- [X] T004 [P] [US1] Add Playwright tests in `e2e/game-layout-balance.spec.ts`: desktop — `boundingBox()` of `data-testid="game-canvas"` (or agreed shell) is horizontally centered within viewport within tolerance per `contracts/README.md`; mobile — no horizontal overflow at width 390px (or agreed contract width).

### Implementation for User Story 1

- [X] T005 [US1] Adjust layout in `src/views/game/GameView.vue` and, only if required, wrapper markup/styles in `src/components/game/GameCanvasShell.vue` so T004 assertions pass without changing canvas game logic in `src/game/*`.
- [X] T006 [US1] Run `pnpm exec playwright test e2e/game-layout-balance.spec.ts` until green; then spot-check resize in browser for spec scenario 3 (nav vs canvas overlap).

**Checkpoint**: US1 done — layout E2E green.

---

## Phase 4: User Story 2 — Cleaner structure without behavior change (Priority: P2)

**Goal**: Reduce duplication, unclear names, and avoidable coupling in `src/components/`, `src/composables/`, `src/game/`; no `localStorage` key/schema changes (FR-002, FR-003).

**Independent Test**: Full `pnpm test` and `pnpm exec playwright test` pass; primary flows unchanged.

### Tests for User Story 2 (mandatory) ⚠️

- [X] T007 [P] [US2] Before refactoring: add or extend failing-first **Vitest** in the most relevant `src/**/*.spec.ts` for any extracted pure helper; if the refactor is rename/move only, extend the nearest existing spec to assert preserved behavior of the touched module(s) before applying the refactor.

### Implementation for User Story 2

- [X] T008 [US2] Execute targeted refactors across `src/views/`, `src/components/`, `src/composables/`, `src/game/` (and `src/constants/` only if needed for naming); consolidate duplicate helpers into a single module or document rationale in `plan.md` Complexity Tracking if duplication must remain.
- [X] T009 [US2] Run `pnpm test` and `pnpm exec playwright test` at repo root; fix regressions until green.

**Checkpoint**: US1 + US2 both satisfied.

---

## Phase 5: User Story 3 — Basic visual regression per screen (Priority: P3)

**Goal**: Playwright screenshot baselines for home, game (seeded), briefcase per `contracts/README.md` (FR-004, SC-002).

**Independent Test**: `pnpm exec playwright test e2e/screens-visual.spec.ts` passes in CI (Chromium).

### Tests for User Story 3 (mandatory) ⚠️

- [X] T010 [P] [US3] Add `e2e/screens-visual.spec.ts` with `toHaveScreenshot` (or locator screenshot) for `/`, `/briefcase`, and `/game?difficulty=medium&seed=111222333` after stable `waitForSelector`/`expect` on existing test ids; tests fail until snapshots exist.

### Implementation for User Story 3

- [X] T011 [US3] Run `pnpm exec playwright test e2e/screens-visual.spec.ts --update-snapshots` locally; commit generated snapshot PNGs under the Playwright snapshot directory for `e2e/screens-visual.spec.ts`.
- [X] T012 [US3] Re-run full `pnpm exec playwright test` (and `pnpm test`) to confirm no flake; adjust waits/`maxDiffPixels` only if documented in task/PR notes.

**Checkpoint**: All three screens have baselines; suite green.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lint and quickstart alignment.

- [X] T013 [P] Run `pnpm lint` at repo root; resolve any new violations from 013 changes.
- [X] T014 Follow `specs/013-layout-refactor-e2e/quickstart.md` once end-to-end (commands succeed as written after your changes).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 → 2 → 3 → 4 → 5 → 6** sequential by phase number.
- **US2** depends on **US1** completing only for product sanity (layout stable before wide refactor); tests are global anyway.
- **US3** should run after US1 so game screenshots reflect corrected layout.

### User Story Dependencies

- **US1**: After Phase 2; blocks MVP demo.
- **US2**: After US1 recommended (fewer snapshot churn conflicts if US3 done after US2).
- **US3**: After US1 (required); after US2 preferred.

### Within Each User Story

- Playwright/Vitest tasks before implementation tasks.
- Do not commit snapshot updates until screenshot tests exist and fail once (TDD for US3).

### Parallel Opportunities

- **T001** and **T002** in parallel.
- **T004** with other work only after T003 — T004 is single file; internal desktop vs mobile tests live same file (sequential in one PR is fine).
- **T007** can start after T006 while snapshots not yet added; **US3** (T010–T012) parallelizable with US2 only if careful about merge conflicts — recommend **US2 then US3** for single developer.

---

## Parallel Example: User Story 1

```bash
# After T003:
# 1. Land T004 (failing), then T005–T006 (green).
pnpm exec playwright test e2e/game-layout-balance.spec.ts
```

---

## Parallel Example: User Story 3

```bash
pnpm exec playwright test e2e/screens-visual.spec.ts --update-snapshots
pnpm exec playwright test e2e/screens-visual.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1–2.  
2. Complete Phase 3 (US1).  
3. Stop and validate: layout E2E + manual resize check.

### Full feature

1. Phases 1–5 in order (US2 before US3 recommended).  
2. Phase 6.

### Suggested execution order (single developer)

`T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014`

---

## Notes

- No new `localStorage` keys; do not edit persistence schemas (see `specs/013-layout-refactor-e2e/contracts/README.md`).  
- Canvas drawing and hit-testing logic remain primary on `<canvas>`; this feature is mostly DOM layout + tests + refactor.  
- If `game-canvas` test id is missing, add `data-testid` in `GameCanvasShell.vue` only if required for layout/visual tests (prefer existing ids from `e2e/tile-visual-polish.spec.ts`).
