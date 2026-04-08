# Implementation Plan: Game Core Logic

**Branch**: `004-game-core-logic` | **Date**: 2026-04-07 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/004-game-core-logic/spec.md`  
**Doc refresh**: Clarifications and remediation after 2026-04-07 (identity **`n`**, restore parity, **FR-014** difficulty-as-init, no reactive difficulty on `/game`) are reflected in this section and in **Project Structure** below—no need to re-run `/speckit.plan` unless the technical stack or constitution gates change.

**Note**: Original template workflow: `.specify/templates/plan-template.md`.

## Summary

Deliver the full **classical memory loop** on the existing **HTML Canvas** board: concealed tiles with left-pivot flip/reveal, match removal and mismatch re-conceal, **responsive** layout targeting **~1200px** content width on desktop with **container-based tile sizing**, **padding** between cells, and **parallax-style** motion driven by pointer/touch. Track **per-session tile click count** (for metrics and a future statistics feature), **difficulty**, and **active-tab-only** elapsed time; **persist** in-progress snapshots and **completed session records** (**won** or **abandoned** via top-left **Abandon game** per spec) to **client storage** for restore and later stats. **Vitest** proves multi-tile logic and timers; **Playwright** (per user story, **single-tile–focused** in the first wave per clarifications) proves representative UI/canvas behavior.

**Cross-cutting consistency (post-analysis):** Tile **faces** MUST resolve from `identityIndex` with **`n` = active deal size** (`cells.length / 2`), never a mismatched settings-only preset (spec **FR-013**). **Restore** MUST re-sync **`GameSettings.difficulty`** from the snapshot **`session`** so easy/medium/hard grids stay aligned after reload. **The Briefcase** MUST confirm **abandon** only when navigating to **`/game`** while **`in_progress`** and the selected difficulty **≠** session difficulty—not when toggling radios (spec **FR-014**). Difficulty MUST NOT be a reactive rebuild trigger on **`/game`**.

## Technical Context

**Language/Version**: TypeScript **5.7** (see root `package.json`), Node **22.x**  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), `vite-plugin-pwa`  
**Storage**: **`localStorage`** for versioned JSON blobs (in-progress snapshot + append-only completed-session list); migrate to **`indexedDB`** only if quota or payload size becomes an issue (documented in `research.md`)  
**Testing**: **Vitest** (`pnpm test`), **Playwright** (`pnpm test:e2e` / `test:e2e:preview`); TDD for new logic  
**Target Platform**: Modern **Chromium**, **Firefox**, **Safari** (desktop + mobile); PWA offline after first load  
**Project Type**: Single-package **Vue SPA** (recruitment / portfolio demo)  
**Performance Goals**: **60 fps** cap for continuous parallax/flip animation; **≤ 1 frame** (`requestAnimationFrame`) between valid pointer/tap and visible flip start on mid-tier hardware; **dirty-region** or **per-tile** redraw where practical to avoid full-canvas clears every move  
**Constraints**: Constitution **canvas-first** gameplay; no runtime CSGO-API or remote tile images; user-visible copy **English**; active play time **must not** advance when tab hidden or document not focused (`document.visibilityState`, `focus`/`blur`)  
**Scale/Scope**: One game route (`/game`), three new e2e spec files (incremental), one primary canvas shell refactor + new Pinia/composables/modules

**Performance note**: Frame/input budgets in this plan are **implementation targets**; there is no mandatory automated perf gate in v1 unless added during polish.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify alignment with `.specify/memory/constitution.md` (CS2 Memory Vue 3). All items MUST pass or be justified in **Complexity Tracking** below.

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind; no exceptions.
- [x] **Canvas**: Playable memory grid (tiles, flip/reveal, hit testing) on HTML Canvas; pointer and touch; not DOM-as-primary game board.
- [x] **Performance**: Measurable budgets stated in **Technical Context** above; details in `research.md`.
- [x] **Responsive + PWA + state**: Desktop and mobile; offline core loop after first load; installable PWA; persistent session state **client-side** via `localStorage` (see `data-model.md` / `contracts/`).
- [x] **Tests**: TDD; **each user story** has a **Playwright** file mapped to scenarios (`e2e/game-core-*.spec.ts`); **initial e2e scope is single-tile (minimal) checks** per **spec clarifications 2026-04-07**—full-grid e2e deferred; **Vitest** covers multi-tile rules, timers, and serialization.
- [x] **Assets**: Existing pipeline—local `public/tiles/*` + `tile-library.json`; `ATTRIBUTION.md` / ingest script unchanged for this feature.
- [x] **Copy + browsers**: English; matrix in `research.md`.
- [x] **Accessibility**: Pointer-first; respect **`prefers-reduced-motion`** for parallax/flip intensity (spec edge case).
- [x] **Repo layout**: Single root `package.json`; Vitest + Playwright under `e2e/`.
- [x] **Design**: No new Stitch milestone required for this feature; visual tokens remain Tailwind / existing theme.
- [x] **CI**: When present, order remains Vitest → `vite build` → preview → Playwright (see `.github/workflows/`).
- [x] **Scope**: Non-commercial recruitment context per constitution and spec.

### Post–Phase 1 re-check

Design artifacts (`research.md`, `data-model.md`, `contracts/`) keep canvas as the sole interactive board, client-only persistence, and the clarified split between **Vitest** (breadth) and **Playwright** (minimal surface). No constitution amendments required.

### As-built notes (documentation)

- **`/game`** does **not** `watch` Pinia difficulty to start a new deal; new rounds come from **mount init**, **win**, **abandon**, or **Briefcase → `/game`** after optional **FR-014** confirm.
- **`useBriefcaseNavigateToGame`**: shared by **Unlock showcase** and **Play** on `BriefcaseViewPage`; prompts only when `in_progress` and selected difficulty ≠ `GameSession.difficulty`.
- **Tile faces**: `GameCanvasShell` resolves library subset size from **active** `cells.length / 2` when memory is loaded (spec **FR-013**).

## Project Structure

### Documentation (this feature)

```text
specs/004-game-core-logic/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1 (storage + test hooks)
└── tasks.md             # Action list (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── GameCanvasShell.vue       # Canvas: paint, hit-test, init/hydrate; no difficulty watcher
│   └── briefcase/
│       └── BriefcaseView.vue     # Radios = next-start only; Unlock → useBriefcaseNavigateToGame
├── views/
│   ├── GameView.vue              # Abandon control, active-time hook
│   └── BriefcaseViewPage.vue     # Play button → useBriefcaseNavigateToGame (not raw link to /game)
├── stores/
│   ├── gameSettings.ts           # difficulty preset for next start + Briefcase UI
│   ├── gamePlay.ts               # Board, pair resolution, memoryEngine
│   └── gameSession.ts            # Metrics, persistence, completed history
├── game/
│   ├── buildGridLayout.ts
│   ├── memoryEngine.ts, memoryTypes.ts, canvasHitTest.ts, cellRect.ts, canvasLayout.ts
│   ├── canvasTileDraw.ts, tileParallax.ts, sessionConstants.ts
│   └── tileLibraryTypes.ts
├── composables/
│   ├── useActivePlayTime.ts      # Active-tab-only ms (FR-009)
│   └── useBriefcaseNavigateToGame.ts  # FR-014: confirm abandon before /game when mismatch
e2e/
├── game-core-playthrough.spec.ts
├── game-core-layout-motion.spec.ts
├── game-core-session-persistence.spec.ts
└── csgo-tile-library-game.spec.ts   # existing; keep or align selectors
```

**Structure Decision**: Single Vue SPA under `src/`; game logic colocated in `src/game/` with Pinia/composables for session time and persistence; tests in `src/**/*.spec.ts` and `e2e/`.

## Phase 0 & Phase 1 outputs

| Artifact | Path |
|----------|------|
| Research | [`research.md`](./research.md) |
| Data model | [`data-model.md`](./data-model.md) |
| Quickstart | [`quickstart.md`](./quickstart.md) |
| Contracts | [`contracts/README.md`](./contracts/README.md), [`contracts/session-storage.schema.json`](./contracts/session-storage.schema.json) |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations; table intentionally empty.
