---
description: 'Task list for 016 wrong-pair tile input during mismatch feedback'
---

# Tasks: Wrong-pair tile input during mismatch feedback (016)

**Input**: Design documents from `/specs/016-wrong-pair-tile-input/`  
**Prerequisites**: [`plan.md`](./plan.md), [`spec.md`](./spec.md), [`research.md`](./research.md), [`data-model.md`](./data-model.md), [`contracts/README.md`](./contracts/README.md), [`quickstart.md`](./quickstart.md)

**Tests (mandatory for this repository)**: Failing-first **Vitest** and **Playwright** per `.specify/memory/constitution.md` and [`spec.md`](./spec.md) User Story 1.

**Organization**: Single P1 user story; setup and a short foundational gate precede engine → store → canvas.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no ordering dependency within the same wave)
- **[Story]**: `[US1]` maps to [`spec.md`](./spec.md) User Story 1
- Descriptions include concrete file paths (relative to repo root: `../../` from this file)

## Phase 1: Setup (shared)

**Purpose**: Align implementer with artifacts, branch scope, and timing constants.

- [x] T001 Read [`specs/016-wrong-pair-tile-input/plan.md`](./plan.md) §Implementation notes and [`specs/016-wrong-pair-tile-input/research.md`](./research.md) §1–5 (interrupt path, `pair.locked`, FR-002 tradeoff, SFX)
- [x] T002 [P] Read [`specs/016-wrong-pair-tile-input/quickstart.md`](./quickstart.md), [`specs/016-wrong-pair-tile-input/data-model.md`](./data-model.md) (transitions + hydrate), and [`specs/016-wrong-pair-tile-input/contracts/README.md`](./contracts/README.md)

---

## Phase 2: Foundational (blocking gate)

**Purpose**: Confirm shared constants and CI expectations before changing game logic.

**⚠️ CRITICAL**: Complete before User Story 1 implementation.

- [x] T003 [P] Verify [`src/game/tiles/tileMotionConstants.ts`](../../src/game/tiles/tileMotionConstants.ts) `MISMATCH_RESOLVE_MS` matches store + canvas usage; no drift after edits
- [x] T004 [P] Skim [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) for Vitest → build → Playwright preview order so new `e2e/*.spec.ts` is picked up automatically

**Checkpoint**: Proceed to User Story 1.

---

## Phase 3: User Story 1 — Continue playing without waiting for mismatch animation (Priority: P1) 🎯 MVP

**Goal**: After a wrong pair, the player can select another **valid concealed** tile **before** mismatch feedback completes; full shake/flip-back + `fail` SFX remain for players who wait. Matches [`spec.md`](./spec.md) User Story 1 / FR-001–FR-004.

**Independent Test**: Vitest for `pickCell` + `tryPick` interrupt/timer; Playwright on preview: wrong pair then third pick without sleeping full `MISMATCH_RESOLVE_MS`; `pnpm test` + `pnpm run test:e2e:preview` green.

### Tests for User Story 1 (mandatory) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [P] [US1] Extend Vitest [`src/game/memory/memoryEngine.spec.ts`](../../src/game/memory/memoryEngine.spec.ts): export and cover **`isWrongPairPending`**; wrong pair returns **`locked: false`**; concealed third index **interrupts** (clears two + reveals third as first pick); taps on wrong-pair indices **rejected**; match path unchanged (maps to acceptance scenarios 1 + 3 / FR-003–FR-004)
- [x] T006 [P] [US1] Extend Vitest [`src/stores/game/gamePlay.spec.ts`](../../src/stores/game/gamePlay.spec.ts): timer arms on wrong pair **without** relying on **`pair.locked`**; interrupt **cancels** timer; timer callback **no-op** if mismatch already cleared; **`hydrateFromSnapshot`** normalizes legacy **`pair.locked: true`** when wrong-pair pending and re-arms timer per [`plan.md`](./plan.md) (maps to FR-001 + [`research.md`](./research.md) §9)
- [x] T007 [P] [US1] Add Playwright [`e2e/game-wrong-pair-input-during-animation.spec.ts`](../../e2e/game-wrong-pair-input-during-animation.spec.ts): open `/game`, perform wrong pair via canvas clicks (reuse layout math from [`e2e/game-core-playthrough.spec.ts`](../../e2e/game-core-playthrough.spec.ts)), then click a third concealed cell **immediately** (no `waitForTimeout(MISMATCH_RESOLVE_MS)`); assert via **`data-testid="game-memory-debug"`** / `data-revealed` (or equivalent) that play advanced; optional second case: wait path still resolves mismatch (regression for FR-002 wait path) (maps to [`spec.md`](./spec.md) acceptance scenarios 1–2)

### Implementation for User Story 1

- [x] T008 [US1] Implement **`isWrongPairPending`** + interrupt branch + wrong-pair **`locked: false`** + **`normalizePairForMismatchPending`** (or equivalent) in [`src/game/memory/memoryEngine.ts`](../../src/game/memory/memoryEngine.ts) per [`plan.md`](./plan.md) §Engine; export helper for canvas
- [x] T009 [US1] Update [`src/stores/game/gamePlay.ts`](../../src/stores/game/gamePlay.ts): arm **`mismatchTimer`** using **`isWrongPairPending`**; guard callback with same predicate; **`hydrateFromSnapshot`** normalize **`locked`** + re-arm timer when wrong-pair pending; on interrupt acceptance, **`playSfx('fail')`** when concealing wrong pair per [`research.md`](./research.md) §5 (coordinate with existing **`sfxOutcomesForPick`** in [`src/components/game/GameCanvasShell.vue`](../../src/components/game/GameCanvasShell.vue) if needed to avoid double SFX)
- [x] T010 [US1] Refactor [`src/components/game/GameCanvasShell.vue`](../../src/components/game/GameCanvasShell.vue): replace **`locked &&`** mismatch predicates with **`isWrongPairPending(mem)`** for **`mismatchShake`**, **`mismatchConceal01ForCell`**, **`computeMismatchPhaseUi`**, **`animationActive`**, and tile draw **`isMismatchTile`**; keep reduced-motion paths correct

### Verification for User Story 1

- [x] T011 [US1] Run `pnpm test`, `pnpm run test:e2e:preview`, and `pnpm lint` from repo root; fix any failures

**Checkpoint**: User Story 1 complete — mergeable MVP.

---

## Phase 4: Polish & cross-cutting

**Purpose**: Manual spot-check and contract N/A confirmation.

- [x] T012 [P] Walk through [`specs/016-wrong-pair-tile-input/quickstart.md`](./quickstart.md) manual steps once after implementation
- [x] T013 [P] Confirm no new `localStorage` / `sessionStorage` keys (N/A per [`data-model.md`](./data-model.md))

---

## Dependencies & execution order

### Phase dependencies

- **Phase 1** → **Phase 2** → **Phase 3** → **Phase 4**
- **Phase 3**: T005–T007 (tests) before T008–T010 (implementation); T008 before T009–T010 (store and shell depend on engine API)

### User story dependencies

- **US1** only; no US2/US3 in this spec.

### Parallel opportunities

- **T005 / T006 / T007** can start together (different files); T006 may need stub expectations until T008 defines final `hydrate` behavior.
- **T012 / T013** in parallel in Phase 4.

### Parallel example: User Story 1 tests

```bash
# Write failing tests in parallel:
# - src/game/memory/memoryEngine.spec.ts
# - src/stores/game/gamePlay.spec.ts
# - e2e/game-wrong-pair-input-during-animation.spec.ts
```

---

## Implementation strategy

### MVP (recommended)

1. Complete Phase 1–2  
2. T005–T007 (red)  
3. T008 → T009 → T010 (green)  
4. T011 then Phase 4  

### Suggested commit boundaries

- After T005–T007: failing tests only  
- After T008: engine + memory tests green  
- After T009–T010: full suite green  

---

## Notes

- Grep for **`pair.locked`** after changes to catch stragglers outside [`GameCanvasShell.vue`](../../src/components/game/GameCanvasShell.vue).  
- Snapshot compatibility: old in-progress saves with **`locked: true`** on wrong pair must still work after [`research.md`](./research.md) §9.  
