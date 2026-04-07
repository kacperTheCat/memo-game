# Tasks: CSGO tile libraries & Game grid display

**Input**: Design documents from `/specs/003-csgo-tile-libraries/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/tile-library.schema.json`, `quickstart.md`

**Tests (mandatory for this repository)**: Every user story includes failing-first **Vitest** and **Playwright** tasks per `.specify/memory/constitution.md`.

**Organization**: Tasks are grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no ordering dependency on incomplete sibling tasks)
- **[Story]**: `[US1]` / `[US2]` / `[US3]` for user-story phases only

## Phase 1: Setup (shared infrastructure)

**Purpose**: Attribution and npm entry for the maintainer ingest pipeline.

- [x] T001 Add `ATTRIBUTION.md` at repo root citing [ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API) (MIT) and that images/metadata are vendored for offline play
- [x] T002 [P] Add `"fetch-tiles": "node scripts/fetch-tile-library.mjs"` to `package.json` (script file created in Phase 2)

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: Pure grid math, library validation, generated data, and shared Pinia settings. **No user story work until this phase completes.**

**⚠️ CRITICAL**: Write **T003–T004** before implementation; they MUST fail until **T005–T006** land.

- [x] T003 [P] Vitest **failing-first**: `src/game/buildGridLayout.spec.ts` — assert `easy` → 4×4 / 16 cells, `medium` → 6×6 / 36, `hard` → 8×8 / 64; assert identity index per cell uses **two full cycles** (`k % n` over `2n` cells) for `n` = 8 / 18 / 32 per `data-model.md`
- [x] T004 [P] Vitest **failing-first**: `src/game/validateTileLibrary.spec.ts` — inline minimal fixtures: reject wrong count, missing fields; accept exactly **32** valid entries (no filesystem yet)
- [x] T005 Implement `src/game/buildGridLayout.ts` exporting typed helpers used by the canvas (import types from `src/game/tileLibraryTypes.ts` if needed) until **T003** passes
- [x] T006 Implement `src/game/validateTileLibrary.ts` (pure validation + optional `fs.existsSync` for `public/` paths used in integration tests) until **T004** passes
- [x] T007 Implement `scripts/fetch-tile-library.mjs`: fetch subset from ByMykel CSGO-API `skins.json` (or pinned raw URL), write **`public/tiles/*`** and **`src/data/tile-library.json`** matching `contracts/tile-library.schema.json`; run once so repo contains generated files for CI
- [x] T008 Extend `src/game/validateTileLibrary.spec.ts` (or `validateTileLibrary.fs.spec.ts`) to validate the **committed** `src/data/tile-library.json` and that every `imagePath` resolves under `public/tiles/` in the repo
- [x] T009 Add `src/stores/gameSettings.ts` with `useGameSettingsStore` (`difficulty: 'easy'|'medium'|'hard'`, default **`medium`**) and export from `src/stores/index.ts` if the project uses a barrel file

**Checkpoint**: `pnpm test` green; `tile-library.json` + `public/tiles/` present; Pinia store available.

---

## Phase 3: User Story 1 — Game screen shows image grid from Briefcase difficulty (Priority: P1) 🎯 MVP

**Goal**: `/game` draws the **correct-size** image grid on **canvas** from **Briefcase** difficulty; **display-only**; English copy.

**Independent Test**: Briefcase **Hard** → Game shows **8×8** meta; **Easy** → **4×4**; direct `/game` → **medium** default.

### Tests for User Story 1 (mandatory) ⚠️

> **Write FIRST; ensure FAIL before T012–T014**

- [x] T010 [P] [US1] Playwright **failing-first**: `e2e/csgo-tile-library-game.spec.ts` — set difficulty on `/briefcase`, navigate `/game`, assert `data-testid="game-grid-meta"` has `data-rows` / `data-cols` matching **4/6/8**; assert direct `/game` uses **medium** (6×6)
- [x] T011 [P] [US1] Vitest **failing-first**: extend `src/components/GameCanvasShell.spec.ts` — mount shell with mocked store + stub `tile-library` data; assert grid meta props or emitted layout matches `buildGridLayout` for at least one difficulty

### Implementation for User Story 1

- [x] T012 [US1] Wire `src/components/briefcase/BriefcaseView.vue` so difficulty radios read/write `useGameSettingsStore().difficulty` (remove isolated `ref` or keep synced)
- [x] T013 [US1] Implement `src/components/GameCanvasShell.vue`: read store + import `src/data/tile-library.json`; use `buildGridLayout`; load/decode images; `drawImage` grid with **DPR**-aware sizing; add **`data-testid="game-grid-meta"`** with **`data-rows`**, **`data-cols`**, **`data-cells`**
- [x] T014 [US1] Update `src/constants/appCopy.ts` and `src/views/GameView.vue` **English** subline/heading if still placeholder (“display-only grid” per spec)
- [x] T015 [US1] Confirm `pnpm test` and `pnpm run test:e2e:preview` green for US1 paths

**Checkpoint**: US1 fully testable alone (grid dimensions + Briefcase link).

---

## Phase 4: User Story 2 — Curated libraries for all grid sizes (Priority: P2)

**Goal**: **Easy/Medium/Hard** all render **correct subset** (first 8 / 18 / 32 identities, each **twice**) with **no** extra asset pipelines.

**Independent Test**: Vitest + Playwright prove **6×6** and **4×4** meta and no broken image paths for subset entries.

### Tests for User Story 2 (mandatory) ⚠️

- [x] T016 [P] [US2] Playwright: extend `e2e/csgo-tile-library-game.spec.ts` (or add `e2e/csgo-tile-library-selection.spec.ts`) — explicit **Medium** → `data-rows="6"` `data-cols="6"`; **Easy** → `4` after switching from another difficulty
- [x] T017 [P] [US2] Vitest: extend `src/game/buildGridLayout.spec.ts` — assert first/last cell maps to expected `TileEntry.id` for each difficulty (stable ordering from `tile-library.json` mock)

### Implementation for User Story 2

- [x] T018 [US2] Harden `src/components/GameCanvasShell.vue` + `buildGridLayout.ts` so image loading **dedupes** by `imagePath` across the **2n** cells (performance per `research.md`)
- [x] T019 [US2] Add short module comment in `src/game/buildGridLayout.ts` linking to `specs/003-csgo-tile-libraries/data-model.md` fill rules

**Checkpoint**: US1 + US2 both pass; subset grids verified.

---

## Phase 5: User Story 3 — Trustworthy metadata & build validation (Priority: P3)

**Goal**: CI fails on bad library data or missing files (FR-005 / spec P3). Playwright confirms **total tile count** on the Game screen matches difficulty (constitution §V / C1).

**Independent Test**: `pnpm test` fails when `tile-library.json` is malformed or an image file is deleted; Playwright asserts `data-cells` **16 / 36 / 64** per difficulty.

### Tests for User Story 3 (mandatory) ⚠️

- [x] T020 [P] [US3] Vitest: `src/game/validateTileLibrary.contract.spec.ts` — import real `src/data/tile-library.json`, run `validateTileLibrary`, assert passes; add **negative** case with temporary mutated object or snapshot of invalid shape (skip mutating committed file—use cloned object in memory)
- [x] T026 [P] [US3] Playwright: `e2e/csgo-tile-library-validation.spec.ts` — for **Easy**, **Medium**, **Hard** (set on `/briefcase`, then `/game`), assert `data-testid="game-grid-meta"` has `data-cells` **16**, **36**, **64** respectively (constitution §V: every user story has Playwright coverage)

### Implementation for User Story 3

- [x] T021 [US3] Ensure `validateTileLibrary` covers **exactly 32** entries, non-empty `rarity`/`color`/`imagePath`, and **file presence** under `public/` so **T008** + **T020** fully enforce FR-005
- [x] T022 [US3] Document in `README.md` (or `quickstart.md` only if README absent) that **`pnpm test`** is the gate for library integrity; keep `specs/003-csgo-tile-libraries/quickstart.md` in sync with actual script name

**Checkpoint**: Library validation is authoritative for CI.

---

## Phase 6: Polish & cross-cutting concerns

- [x] T023 [P] Update `src/components/GameCanvasShell.vue` **`role` / `aria-label`** to describe the static grid (English) for the real board, not the placeholder string
- [x] T024 [P] Run manual steps in `specs/003-csgo-tile-libraries/quickstart.md` and fix any drift (paths, script name)
- [x] T025 Confirm `.github/workflows/ci.yml` still runs **Vitest before Playwright** and that new specs are picked up without changes (if not, adjust workflow)

---

## Dependencies & execution order

### Phase dependencies

| Phase | Depends on |
|--------|------------|
| Phase 1 | — |
| Phase 2 | Phase 1 (T002 script name) |
| Phase 3 (US1) | Phase 2 complete |
| Phase 4 (US2) | US1 implementation (T013) for shared canvas behavior |
| Phase 5 (US3) | Phase 2 **T008** / validation helpers |
| Phase 6 | Desired user stories complete |

### User story dependencies

- **US1**: After Phase 2; no dependency on US2/US3.
- **US2**: After US1 canvas + store exist (**T013**); independently testable via its own tests.
- **US3**: Parallel with US1/US2 after **T006–T008**; strengthens CI guarantees.

### Within each user story

1. Write failing **Vitest** / **Playwright** tasks.  
2. Implement until green.  
3. Do not start next story’s implementation until prior checkpoint is acceptable (MVP = stop after US1).

### Parallel opportunities

- **T003** ∥ **T004** (both specs, different files).  
- **T010** ∥ **T011** (Playwright vs Vitest).  
- **T016** ∥ **T017**.  
- **T020** ∥ **T026** once **T006–T008** and **T013** exist (US3 Vitest vs Playwright).  
- **T023** ∥ **T024**.

---

## Parallel example: User Story 1

```bash
# After Phase 2 done, start US1 tests together:
# - e2e/csgo-tile-library-game.spec.ts
# - src/components/GameCanvasShell.spec.ts
```

---

## Implementation strategy

### MVP first (User Story 1 only)

1. Complete Phase 1–2.  
2. Complete Phase 3 (US1).  
3. **STOP**: `pnpm test` + `pnpm run test:e2e:preview` — demo Briefcase → Game grid.

### Incremental delivery

1. MVP (US1) → ship/demo.  
2. Add US2 (subset + E2E matrix).  
3. Add US3 (contract validation hardening).  
4. Polish phase.

---

## Task summary

| Phase | Task IDs | Count |
|-------|-----------|-------|
| Setup | T001–T002 | 2 |
| Foundational | T003–T009 | 7 |
| US1 | T010–T015 | 6 |
| US2 | T016–T019 | 4 |
| US3 | T020–T022, T026 | 4 |
| Polish | T023–T025 | 3 |
| **Total** | **T001–T026** (excl. gap) | **26** |

**Per user story (implementation + tests)**: US1 — 6 tasks; US2 — 4 tasks; US3 — 4 tasks (includes **T026** Playwright).

**Suggested MVP scope**: Phase 1 + Phase 2 + Phase 3 (through **T015**).
