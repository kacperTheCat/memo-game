# Implementation Plan: Game tile visual polish and motion (008)

**Branch**: `008-game-tile-polish` | **Date**: 2026-04-08 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/008-game-tile-polish/spec.md`

## Summary

Deliver canvas-first tile polish: **neutral backs**, **unified face** (gradient + art + glass in one rect), **smoothed parallax**, **flip** on reveal, **mismatch feedback as two phases** (**shake while face-up**, then **flip back to concealed**—**FR-010**), and a **collect-and-merge** animation on correct pairs (tiles **move** toward a **collection strip below the grid**, **scale down**, **merge into one chip** per pair, **left-to-right** in match order—**FR-009**). **No** simple fade-only removal for matches; **no** instant pop to concealed on mismatch. Performance **≥60 fps** (**120 fps** stretch) for flip, collect, **mismatch sequence**, and parallax (**FR-012** / **SC-007**).

**Technical approach:** Single 2D canvas (`GameCanvasShell.vue`) with parametric drawing; pure easing/helpers under `src/game/` ([`research.md`](./research.md)). **Collection strip** + **board band** share one canvas; hit testing ignores the strip band. Ephemeral **collect flight** and **mismatch visual phases** live in the shell only. **`localStorage`** snapshot schema unchanged v1—**strip not persisted** ([`data-model.md`](./data-model.md)).

## Technical Context

**Language/Version**: TypeScript **5.7**, Node **22.x** (root `package.json`)  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), `vite-plugin-pwa`  
**Storage**: `localStorage` keys `memo-game.v1.inProgress`, `memo-game.v1.completedSessions` (no new keys; strip not in snapshot v1)  
**Testing**: Vitest **3** (`src/**/*.spec.ts`), Playwright **~1.49** (`e2e/`)  
**Target Platform**: Modern browsers (Chromium, Firefox, Safari)—[`research.md`](./research.md) §8  
**Project Type**: SPA (Vue) — canvas-first game surface  
**Performance Goals**: **≥60 fps** during flip, collect/merge, **mismatch shake + flip-back**, parallax; **120 fps** stretch (**SC-007**)  
**Constraints**: Canvas-first board (constitution); English copy; offline core after first load (PWA)  
**Scale/Scope**: `/game` grid + strip; overflow per spec edge case (scroll or scale chips)

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind.
- [x] **Canvas**: Playable grid, flip/collect/**mismatch sequence**, hit testing on HTML Canvas.
- [x] **Performance**: FR-012 / SC-007 define measurable animation budgets.
- [x] **Responsive + PWA + state**: Client-side persistence named; strip non-persisted v1.
- [x] **Tests**: Playwright (`e2e/tile-visual-polish.spec.ts`) + Vitest per spec / FR-013.
- [x] **Assets**: Local `public/tiles`; no runtime remote tile hosts.
- [x] **Copy + browsers**: English; matrix in `research.md` §8.
- [x] **Accessibility**: Pointer-first per constitution.
- [x] **Repo layout**: Single root `package.json`; `e2e/` + Vitest colocated.
- [x] **Design**: Stitch optional; glassmorphism references in spec.
- [x] **CI**: Vitest → build → preview → Playwright when workflow present.
- [x] **Scope**: Non-commercial / portfolio context in README & spec.

## Project Structure

### Documentation (this feature)

```text
specs/008-game-tile-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── game-canvas-ui.md
├── checklists/
└── tasks.md              # /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   └── GameCanvasShell.vue       # rAF paint, collect strip, mismatch phases
├── game/
│   ├── canvasLayout.ts           # board + strip band split
│   ├── canvasTileDraw.ts         # unified face, collect + flip-back draw
│   ├── canvasHitTest.ts          # board region only
│   ├── cellRect.ts
│   ├── tileParallaxSmooth.ts
│   ├── tileMotionConstants.ts    # collect, shake, flip-back durations
│   ├── animationEasing.ts
│   ├── rarityTier.ts
│   ├── tileFaceStyle.ts
│   ├── memoryEngine.ts
│   └── memoryTypes.ts
├── stores/
│   ├── gamePlay.ts
│   └── gameSession.ts
e2e/
└── tile-visual-polish.spec.ts
```

**Structure Decision**: Single-package Vue SPA; pure layout/timing helpers unit-tested; optional SR-only **`data-mismatch-phase`** for ordered mismatch tests ([`contracts/game-canvas-ui.md`](./contracts/game-canvas-ui.md)).

## Phase 0–1 outputs

| Artifact | Purpose |
|----------|---------|
| [`research.md`](./research.md) | Canvas-first collect + **§11 mismatch shake→flip-back** |
| [`data-model.md`](./data-model.md) | `collectFlight`, `stripChips`, **mismatch visual phases** |
| [`contracts/game-canvas-ui.md`](./contracts/game-canvas-ui.md) | `game-collect-strip`, mismatch phase hooks |
| [`quickstart.md`](./quickstart.md) | Dev, tests, FPS checklist |

## Implementation notes

### Collect (**FR-009**)

1. Partition canvas height: **board band** + **strip band**; `cellRectsForGrid` uses board band only.  
2. On match: paired flight (position + monotonic scale) → one strip chip; **FR-009a** input rules.  
3. Playwright: `data-collect-count` / strip metadata within **SC-003** window.

### Mismatch (**FR-010**)

1. **Phase A—shake:** wobble/offset while tiles render **face-up** (`revealFlipT` effectively 1).  
2. **Phase B—flip-back:** drive **conceal** progress 1→0 (mirror **FR-008**), then align with engine `concealed`.  
3. Total duration within **SC-004**; avoid logic/visual desync (**FR-011**, spec edge case on mismatch timing).  
4. Constants in `tileMotionConstants.ts`; optional `data-mismatch-phase` (`shake` \| `flip_back` \| `idle`) on shell for E2E.

### Tests (**FR-013**)

- Vitest: strip slot geometry, collect easing, **phase timing splits** for mismatch if extracted.  
- Playwright: collect end state; mismatch **order** smoke via phase attribute or timing polls.

## Complexity Tracking

None. Optional animation library deferred per `research.md` §2 unless profiling requires it.
