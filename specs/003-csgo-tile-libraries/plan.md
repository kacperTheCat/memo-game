# Implementation Plan: CSGO tile libraries & Game grid display

**Branch**: `003-csgo-tile-libraries` | **Date**: 2026-04-07 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification `specs/003-csgo-tile-libraries/spec.md`

## Summary

Ship a **Pinia-backed** shared **difficulty** (from **The Briefcase**) that drives a **read-only** **image tile grid** on the **`/game`** route. The grid is drawn on the **existing HTML canvas** (`GameCanvasShell`) using **bundled** artwork and **`tile-library.json`** (32 entries: `id`, `rarity`, `color`, `imagePath`). A **one-time Node script** ingests images and JSON from **[ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API)** (MIT) into `public/tiles/` and `src/data/tile-library.json`. **No** memory gameplay (flip/match/win) in this phase. **Vitest** validates library shape and files; **Playwright** covers Briefcase → Game dimensions per **P1/P2**.

## Technical Context

**Language/Version**: TypeScript **5.7** / Node **22.x** (see `package.json`)  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), Vitest **3**, Playwright **1.49**  
**Storage**: Static files only—`public/tiles/*`, `src/data/tile-library.json`; Pinia in-memory **`GameSettings`** (default difficulty **`medium`** for direct `/game` visits)  
**Testing**: Vitest (`src/**/*.spec.ts`); Playwright (`e2e/`, `vite build` + preview for main config)  
**Target Platform**: Responsive **PWA** SPA (desktop + mobile browsers); see `research.md` for browser matrix  
**Project Type**: Single-package Vue frontend (`memo-game` root `package.json`)  
**Performance Goals**: Decode **≤32** unique images in parallel; first full grid draw **~<500 ms** desktop (informational; see `research.md`)  
**Constraints**: No runtime fetch to CSGO-API or remote image hosts for the grid; English UI copy; canvas is the **game board** surface (constitution II)  
**Scale/Scope**: One primary library (32 tiles), three difficulties (4×4 / 6×6 / 8×8), deterministic **duplicate** fill per spec Assumptions  

## Constitution Check

*GATE: Passed. Canvas hosts the grid paint; DOM wraps chrome only.*

- [x] **Stack**: Vue 3 + TS + Vite + Vitest + Pinia + Tailwind
- [x] **Canvas**: Tile **grid imagery** drawn on **HTML Canvas** in `GameCanvasShell`; not a DOM-primary board
- [x] **Performance**: Decode strategy + informal paint budget in `research.md` §8
- [x] **Responsive + PWA + state**: Existing PWA; new state = Pinia `GameSettings` (client-only)
- [x] **Tests**: TDD; Playwright for P1/P2 (`e2e/csgo-tile-library-game.spec.ts`, optional split for P2); Vitest + Playwright for P3 (`validateTileLibrary` + `e2e/csgo-tile-library-validation.spec.ts` for `data-cells`)
- [x] **Assets**: One-time ingest script; local static assets; attribution in `quickstart.md` + repo `ATTRIBUTION`/`README`
- [x] **Copy + browsers**: English; matrix in `research.md` §1
- [x] **Accessibility**: Pointer-first; canvas `aria-label` updated when grid is real
- [x] **Repo layout**: Single root `package.json`; `e2e/` colocated
- [x] **Design**: Stitch **not** required for this feature (per spec); Briefcase already aligned to `designs/.../the_briefcase_main_menu/`
- [x] **CI**: `.github/workflows/ci.yml` — Vitest → Playwright bootstrap → Playwright (build embedded in Playwright config)
- [x] **Scope**: Recruitment/portfolio context remains in README/spec as applicable

## Project Structure

### Documentation (this feature)

```text
specs/003-csgo-tile-libraries/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── tile-library.schema.json
├── spec.md
├── checklists/
└── tasks.md              # from /speckit.tasks (not created by this command)
```

### Source code (repository root)

```text
src/
├── components/
│   ├── GameCanvasShell.vue    # canvas sizing, draw grid, load images
│   └── briefcase/
│       └── BriefcaseView.vue  # wire difficulty → Pinia
├── constants/
│   └── appCopy.ts
├── data/
│   └── tile-library.json      # generated — 32 entries
├── game/
│   ├── buildGridLayout.ts     # pure: difficulty → cell list (Vitest)
│   └── validateTileLibrary.ts # pure + fs checks in tests
├── stores/
│   └── gameSettings.ts        # Pinia: difficulty
├── views/
│   └── GameView.vue
scripts/
└── fetch-tile-library.mjs     # or .ts — maintainer ingest
public/
└── tiles/                     # generated images
e2e/
├── briefcase-view.spec.ts
└── csgo-tile-library-game.spec.ts   # new
```

**Structure Decision:** Single Vue app; new modules under `src/game/` for pure logic; generated assets under `public/tiles/` and `src/data/`.

## Complexity Tracking

No constitution violations. **Canvas** is used for the grid; **Pinia** replaces Briefcase-local-only difficulty for cross-route consistency.

## Phase 0: Research

**Output:** [`research.md`](./research.md) — resolves: browser matrix, Pinia store, canvas rendering, ingest pipeline, deterministic fill, validation strategy, E2E hooks, performance note.

## Phase 1: Design & contracts

| Artifact | Path |
|----------|------|
| Data model | [`data-model.md`](./data-model.md) |
| JSON Schema | [`contracts/tile-library.schema.json`](./contracts/tile-library.schema.json) |
| Developer quickstart | [`quickstart.md`](./quickstart.md) |

**Contracts:** The app “contract” for this feature is the **shape of `tile-library.json`** (schema above). No public HTTP API.

## Phase 2: Implementation outline (for `/speckit.tasks`)

1. **Ingest script** + `pnpm run fetch-tiles`: produce `public/tiles/*` + `src/data/tile-library.json`.
2. **`validateTileLibrary` + Vitest** (32 entries, schema, files exist).
3. **`buildGridLayout`** + Vitest (easy/medium/hard sizes and duplicate ordering).
4. **Pinia `gameSettings`**: register in `main.ts`; default `medium`.
5. **BriefcaseView**: sync `difficulty` ↔ store (replace or mirror local `ref`).
6. **GameCanvasShell**: read store + import JSON; compute layout; `Image` decode; draw; expose `data-testid="game-grid-meta"` with `data-rows` / `data-cols` / `data-cells`.
7. **Playwright** `e2e/csgo-tile-library-game.spec.ts`: Briefcase Hard → Game `data-cols="8"`; Easy → `4`; direct `/game` → medium default.
8. **Copy** updates for `gamePageSubline` if needed (English).
9. **Attribution** file or README blurb for CSGO-API.

## Agent context

After editing this plan, run:

```bash
.specify/scripts/bash/update-agent-context.sh cursor-agent
```

---

## Completion (this command)

- **Branch:** `003-csgo-tile-libraries`
- **Plan:** `specs/003-csgo-tile-libraries/plan.md`
- **Generated:** `research.md`, `data-model.md`, `contracts/tile-library.schema.json`, `quickstart.md`

**Suggested next command:** `/speckit.tasks` to produce `tasks.md`.
