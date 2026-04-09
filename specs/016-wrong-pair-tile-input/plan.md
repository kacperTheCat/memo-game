# Implementation Plan: Wrong-pair tile input during mismatch feedback (016)

**Branch**: `016-wrong-pair-tile-input` | **Date**: 2026-04-09 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/016-wrong-pair-tile-input/spec.md`

## Summary

Remove **input blocking** after a **wrong pair** by allowing **`pickCell`** to accept a **valid concealed** tile **while mismatch feedback is still running**, using a single **atomic** transition (**clear mismatch + start next pick**). Keep **`MISMATCH_RESOLVE_MS`**, canvas **shake / flip-back**, and **`fail`** SFX for players who **wait**. Refactor **wrong-pair detection** off **`pair.locked`** so **`GameCanvasShell.vue`** still animates mismatch whenever a wrong pair is pending. Cover with **Vitest** (engine + store) and **Playwright** (`e2e/game-wrong-pair-input-during-animation.spec.ts`).

## Technical Context

**Language/Version**: TypeScript **5.7**, Node **22.x** (root `package.json` `engines`)  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), **`vite-plugin-pwa`**  
**Storage**: **N/A** — no new client persistence ([`data-model.md`](./data-model.md), [`contracts/README.md`](./contracts/README.md))  
**Testing**: Vitest **3** (`src/**/*.spec.ts`), Playwright **~1.49** (`e2e/`; preview on **127.0.0.1:4173** via `pnpm run test:e2e:preview`)  
**Target Platform**: Responsive SPA; canvas-first game; PWA offline core loop unchanged  
**Project Type**: Vue SPA  
**Performance Goals**: No extra full-canvas redraw pattern; one branch on input path ([`research.md`](./research.md) §7)  
**Constraints**: Constitution **canvas-first**; English copy; pointer + touch; mismatch timing constants stay aligned across store and shell (`tileMotionConstants.ts`)  
**Scale/Scope**: **`memoryEngine`**, **`gamePlay`** store, **`GameCanvasShell`**, specs/tests only

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind.
- [x] **Canvas**: Play remains on **HTML Canvas**; no DOM grid for primary hits.
- [x] **Performance**: Budget noted in [`research.md`](./research.md) §7; no new animation loops.
- [x] **Responsive + PWA + state**: No new persistence keys; client-only state ([`contracts/README.md`](./contracts/README.md)).
- [x] **Tests**: P1 story → Playwright file named in spec + Vitest for rules; TDD during implementation ([`research.md`](./research.md) §8).
- [x] **Assets**: Unchanged; local `public/tiles`, `public/audio`; attribution in contracts README.
- [x] **Copy + browsers**: English; CI Chromium; matrix in [`research.md`](./research.md) §6.
- [x] **Accessibility**: Pointer-first; no new timing-only requirement.
- [x] **Repo layout**: Single root `package.json`; `e2e/` + Vitest colocated.
- [x] **Design**: No Stitch change; motion uses existing mismatch constants.
- [x] **CI**: Existing Vitest → build → Playwright preview workflow picks up new E2E by filename.
- [x] **Scope**: Recruitment/portfolio context unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/016-wrong-pair-tile-input/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── README.md        # Persistence + gameplay testing contract
└── tasks.md             # /speckit.tasks (not created by /speckit.plan)
```

### Source Code (repository root)

```text
src/game/memoryEngine.ts          # Wrong-pair pending + interrupt pick
src/game/memoryEngine.spec.ts
src/game/tileMotionConstants.ts   # Unchanged values; keep store/shell aligned
src/stores/gamePlay.ts            # Timer arms on wrong pair; cancel / no-op
src/stores/gamePlay.spec.ts
src/components/GameCanvasShell.vue  # isMismatchTile / shake / mismatchActive use wrong-pair predicate
e2e/game-wrong-pair-input-during-animation.spec.ts
```

**Structure Decision**: Single-package Vue SPA; logic stays in **`memoryEngine`** + Pinia; canvas reads **`MemoryState`** only.

## Phase 0–1 outputs

| Artifact | Purpose |
|----------|---------|
| [`research.md`](./research.md) | Current code paths, interrupt vs timer, FR-002 tradeoff, testing map |
| [`data-model.md`](./data-model.md) | Wrong-pair pending, transitions, hydration note |
| [`contracts/README.md`](./contracts/README.md) | No new keys; informal gameplay + E2E contract |
| [`quickstart.md`](./quickstart.md) | Manual + command verification |

## Implementation notes

### Engine (`memoryEngine.ts`)

1. Add **`isWrongPairPending(state)`** (or equivalent): two indices, both **`revealed`**, identities differ.
2. On pick: if **wrong-pair pending** and index is **concealed** and **not** one of the two indices → **`clearMismatch(state)`** then apply **first-tile reveal** for `index` in one returned state (or delegate to a small internal helper to avoid duplication).
3. Wrong second tile: return **`locked: false`** (and keep **`firstIndex`/`secondIndex`**) so the generic **`if (state.pair.locked)`** gate does not block the next valid pick. Remove/adjust the **`secondIndex !== null`** blanket reject so it **does not** block this interrupt path (handle mismatch pending **before** that guard).
4. Extend **`memoryEngine.spec.ts`** for interrupt, double-tap on wrong tiles, match path unchanged.

### Store (`gamePlay.ts`)

1. Start **`mismatchTimer`** when **`isWrongPairPending(st)`** after a pick, **without** requiring **`pair.locked`**.
2. On **accepted** **`tryPick`**, **`clearMismatchTimer()`** before applying new state (preserve comment intent: avoid cancelling timer except on accepted state change).
3. Timer callback: **`clearMismatch`** only if still wrong-pair pending; then **`playSfx('fail')`**.
4. **Hydrate**: if snapshot has wrong-pair pending, re-arm timer if product supports mid-round reload (same wall-clock behavior as live play). Normalize legacy **`pair.locked: true`** to **`false`** when wrong-pair pending so pre-016 snapshots still accept interrupts ([`research.md`](./research.md) §9).

### Canvas (`GameCanvasShell.vue`)

1. Replace **`locked &&`** mismatch checks with **`isWrongPairPending(mem)`** (import shared helper from engine or duplicate minimal predicate—prefer **one** export to avoid drift).
2. **`animationActive`**: treat wrong-pair pending like today’s mismatch block so the RAF loop keeps painting through shake/flip-back.

### SFX

Align interrupt path with [`research.md`](./research.md) §5 (`fail` when concealing wrong pair on interrupt).

### Playwright

New **`e2e/game-wrong-pair-input-during-animation.spec.ts`**: seeded deal or **`?seed=`** if supported; wrong pair then fast third pick; assert **no** full wait for **`MISMATCH_RESOLVE_MS`**; optional control case: wait path still shows mismatch behavior.

## Complexity Tracking

None.

## Post-design Constitution Check

Re-evaluated after Phase 1: all checklist items remain satisfied; no violations.
