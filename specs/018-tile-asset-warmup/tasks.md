---
description: 'Task list for 018 tile asset warmup and non-blocking board paint'
---

# Tasks: Tile asset warmup and non-blocking board paint (018)

**Input**: Design documents from `/specs/018-tile-asset-warmup/`  
**Prerequisites**: [`plan.md`](./plan.md), [`spec.md`](./spec.md), [`research.md`](./research.md), [`data-model.md`](./data-model.md), [`contracts/README.md`](./contracts/README.md), [`quickstart.md`](./quickstart.md)

**Tests (mandatory for this repository)**: Vitest + Playwright per `.specify/memory/constitution.md` and [`spec.md`](./spec.md).

**Organization**: User Story 1 (P1) canvas + tests first; User Story 2 (P2) hub warmup + Vitest paths. Tasks marked **[x]** — implemented before this documentation pass.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files)
- **[Story]**: `[US1]` / `[US2]` maps to [`spec.md`](./spec.md)

## Phase 1: Setup

**Purpose**: Read artifacts and locate touchpoints.

- [x] T001 Read [`spec.md`](./spec.md), [`plan.md`](./plan.md) §Summary + §Implementation notes, [`contracts/README.md`](./contracts/README.md)
- [x] T002 [P] Read [`research.md`](./research.md), [`quickstart.md`](./quickstart.md), [`data-model.md`](./data-model.md)

---

## Phase 2: Foundational

**Purpose**: Confirm no persistence drift and shared layout rules.

- [x] T003 [P] Confirm [`src/game/canvas/buildGridLayout.ts`](../../src/game/canvas/buildGridLayout.ts) `n` values (8 / 18 / 32) are the single source for warmup subset size
- [x] T004 [P] Confirm no new `localStorage` / `sessionStorage` keys (N/A per [`data-model.md`](./data-model.md))

**Checkpoint**: Proceed to US1.

---

## Phase 3: User Story 1 — Non-blocking canvas + loading affordance (Priority: P1)

**Goal**: Grid paints immediately; `aria-busy` + overlay until deal skins ready; fatal error fallback. Maps to [`spec.md`](./spec.md) US1 / FR-001–FR-004.

**Independent Test**: Playwright direct `/game`; Vitest for tile draw remains covered by existing `canvasTileDraw` tests; shell behavior via component + e2e.

### Tests for User Story 1 (mandatory)

- [x] T005 [P] [US1] Playwright [`e2e/tile-asset-warmup.spec.ts`](../../e2e/tile-asset-warmup.spec.ts): direct `/game` — `game-canvas` ends with `aria-busy="false"` and loading overlay hidden within timeout (maps to acceptance scenarios 1–2)
- [x] T006 [P] [US1] Playwright [`e2e/screens-visual.spec.ts`](../../e2e/screens-visual.spec.ts): assert `game-canvas-assets-loading` not visible before shell screenshot (maps to SC-004 / stable baseline)

### Implementation for User Story 1

- [x] T007 [US1] Refactor [`src/components/game/GameCanvasShell.vue`](../../src/components/game/GameCanvasShell.vue): async image batch without blocking first paint; generation token; `shellAssetsPending`, `tileImagesLoadFailed`; template overlay + `aria-busy`
- [x] T008 [US1] Rely on [`src/game/canvas/canvasTileDraw.ts`](../../src/game/canvas/canvasTileDraw.ts) face placeholder when `img` incomplete (no change required if already present)

**Checkpoint**: US1 complete.

---

## Phase 4: User Story 2 — Hub warmup (Priority: P2)

**Goal**: Idle preload of difficulty-scoped paths from Home and Briefcase. Maps to [`spec.md`](./spec.md) US2 / FR-005–FR-008.

**Independent Test**: Vitest path lengths; Playwright hub path in `e2e/tile-asset-warmup.spec.ts`.

### Tests for User Story 2 (mandatory)

- [x] T009 [P] [US2] Vitest [`src/game/tiles/tileImagePreload.spec.ts`](../../src/game/tiles/tileImagePreload.spec.ts): `tileImagePathsForDifficulty` lengths and alignment with library order (maps to FR-005–FR-006 / acceptance 2–3)
- [x] T010 [P] [US2] Playwright [`e2e/tile-asset-warmup.spec.ts`](../../e2e/tile-asset-warmup.spec.ts): visit `/` then `/briefcase` then `/game` — settled canvas / non-stuck busy (maps to acceptance 1–2)

### Implementation for User Story 2

- [x] T011 [P] [US2] Add [`src/game/tiles/tileImagePreload.ts`](../../src/game/tiles/tileImagePreload.ts): `scheduleTileImageWarmup`, idle + concurrency
- [x] T012 [US2] Wire [`src/views/home/HomeView.vue`](../../src/views/home/HomeView.vue) `onMounted` → `scheduleTileImageWarmup(settings.difficulty)`
- [x] T013 [US2] Wire [`src/components/briefcase/BriefcaseView.vue`](../../src/components/briefcase/BriefcaseView.vue) `onMounted` + `watch(difficulty)` → `scheduleTileImageWarmup`

**Checkpoint**: US2 complete.

---

## Phase 5: Polish & cross-cutting

- [x] T014 [P] Run `pnpm test`, `pnpm lint`, and targeted Playwright files from [`quickstart.md`](./quickstart.md)
- [x] T015 [P] Speckit docs in `specs/018-tile-asset-warmup/` (this file + checklist + plan/spec/research/data-model/contracts/quickstart)

---

## Dependencies & execution order

- Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
- US1 implementation (T007) before relying on e2e stability; T005–T006 may be written red-first historically
- US2 (T011–T013) after or parallel to US1; T009 independent of canvas shell

## Parallel opportunities

- T005 / T006 / T009 in parallel once behavior exists
- T011 / T012 / T013: module first, then two Vue call sites

## Implementation strategy

Deliver **US1** first (perceived board fix on `/game`), then **US2** (hub optimization). Documentation landed last as retroactive Speckit closure.
