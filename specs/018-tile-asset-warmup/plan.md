# Implementation Plan: Tile asset warmup and non-blocking board paint (018)

**Branch**: `018-tile-asset-warmup` | **Date**: 2026-04-09 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/018-tile-asset-warmup/spec.md`

## Summary

Improve perceived performance of skin PNGs on the HTML Canvas game board by (1) painting the grid immediately with backs and existing face placeholders while images load asynchronously, (2) exposing `aria-busy` and a short English loading label until the deal’s images are ready, and (3) preloading the difficulty-scoped skin subset from Home and Briefcase during idle time so `/game` often hits a warm HTTP cache. No new persistence keys.

## Technical Context

**Language/Version**: TypeScript 5.7, Node 22.x (see root `package.json` `engines`)  
**Primary Dependencies**: Vue 3.5, Vite 6, Pinia 3, Vue Router 4, Tailwind 4 (`@tailwindcss/vite`), `vite-plugin-pwa`  
**Storage**: N/A for this feature (browser cache + in-memory `Image` elements only)  
**Testing**: Vitest 3, Playwright ~1.49 (`e2e/`), CI: Vitest → `vite build` → `vite preview` → Playwright  
**Target Platform**: Evergreen Chromium / Firefox / Safari (see `research.md`)  
**Project Type**: Vue SPA (single root `package.json`)  
**Performance Goals**: Hub remains responsive; canvas paint not blocked on `Promise.all` of all deal images; bounded concurrent image fetches during warmup (default 6)  
**Constraints**: Constitution canvas-first gameplay; English UI copy; no runtime fetch of CSGO-API for gameplay assets  
**Scale/Scope**: 8–32 PNGs per difficulty; one shell overlay + small preload module

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify alignment with `.specify/memory/constitution.md` (CS2 Memory Vue 3). All items MUST pass or be justified in **Complexity Tracking** below.

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind; exceptions documented with rationale.
- [x] **Canvas**: Playable memory grid (tiles, flip/reveal, hit testing) on HTML Canvas; pointer and touch; not DOM-as-primary game board.
- [x] **Performance**: Plan/spec define measurable interaction and rendering budgets where relevant.
- [x] **Responsive + PWA + state**: Desktop and mobile; offline core loop after first load; installable PWA; all persistent state client-side (mechanism named). *This feature adds no new persistence.*
- [x] **Tests**: TDD; every user story has Playwright coverage mapped to acceptance scenarios; Vitest for unit/component logic.
- [x] **Assets**: One-time ingest from [ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API); local static assets; no runtime dependency on API/remote image hosts for core gameplay; attribution documented.
- [x] **Copy + browsers**: User-visible text English; browser matrix in this plan or `research.md` (latest + LTS/extended-support for Chromium, Firefox, Safari as applicable).
- [x] **Accessibility**: Pointer-first scope; no mandated screen-reader/WCAG unless constitution amended. *`aria-busy` is an incremental affordance; not a full SR audit.*
- [x] **Repo layout**: Single root `package.json`; Vitest + Playwright colocated (`e2e/` or `tests/e2e/`); no separate E2E-only repo unless plan-approved workspace exception.
- [x] **Design**: Stitch referenced in spec/plan when UI design is produced; visual tokens stay in code/config/docs—not constitution. *No new Stitch deliverable; overlay uses existing Tailwind memo tokens.*
- [x] **CI** (if GitHub Actions or equivalent): Vitest → `vite build` → `vite preview` → Playwright; details in `.github/workflows/`, not constitution.
- [x] **Scope**: Recruitment/portfolio context and non-commercial posture acknowledged in README or spec where appropriate.

## Project Structure

### Documentation (this feature)

```text
specs/018-tile-asset-warmup/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── README.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/game/GameCanvasShell.vue    # non-blocking paint, overlay, aria-busy, load error
├── views/home/HomeView.vue                  # schedule warmup on mount
├── components/briefcase/BriefcaseView.vue   # warmup on mount + difficulty watch
├── game/
│   ├── canvas/canvasShellAssets.ts         # per-shell Image cache + ensureImage
│   ├── canvas/canvasTileDraw.ts            # face placeholder when img missing
│   └── tiles/tileImagePreload.ts           # paths for difficulty + idle preload
└── data/tile-library.json
e2e/
├── tile-asset-warmup.spec.ts               # US1 + US2 Playwright
└── screens-visual.spec.ts                  # waits for settled assets (US1)
```

**Structure Decision**: Single-package Vue SPA; game logic and canvas remain under `src/game/` and `src/components/game/` per existing layout.

## Complexity Tracking

> No constitution violations required for this feature.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Implementation notes (retroactive)

- **GameCanvasShell**: Removed blocking `await Promise.all(ensureImage)` before the tile draw loop; kick off one batch per deal generation; `schedulePaint` when batch settles; `shellAssetsPending` drives overlay + `aria-busy`; `tileImagesLoadFailed` preserves full-canvas fallback.
- **tileImagePreload**: `tileImagePathsForDifficulty` uses `gridDimensions` + `tile-library.json` slice; `scheduleTileImageWarmup` uses `requestIdleCallback` (fallback `setTimeout`) and concurrent `Image()` loads with optional `decode()`.
- **Tests**: `src/game/tiles/tileImagePreload.spec.ts`; `e2e/tile-asset-warmup.spec.ts`; `e2e/screens-visual.spec.ts` assertion for `game-canvas-assets-loading` hidden before screenshot.
