# Implementation Plan: Layout balance, maintainability refactor, and screen visual checks

**Branch**: `013-layout-refactor-e2e` | **Date**: 2026-04-09 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/013-layout-refactor-e2e/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Re-balance the **game screen** layout so the canvas and chrome are not visually biased to the **right** on desktop while staying usable on mobile. Perform a **targeted refactor** of Vue components, composables, and small utilities to remove clear redundancy, weak names, and avoidable coupling—without changing gameplay rules or persistence semantics. Add **Playwright screenshot baselines** for **home**, **game**, and **briefcase** at fixed viewports and deterministic game state; existing CI already runs the full Playwright suite after Vitest and a production preview build, so new specs run in the same job unless explicitly split later.

## Technical Context

**Language/Version**: TypeScript 5.7, Node.js ^22 (see root `package.json`)  
**Primary Dependencies**: Vue 3.5, Vite 6, Pinia 3, Vue Router 4, Tailwind 4 (`@tailwindcss/vite`), `vite-plugin-pwa`, Vitest 3, Playwright ~1.49  
**Storage**: Client-only — existing `localStorage` keys per [`specs/012-pwa-offline-install/contracts/README.md`](../012-pwa-offline-install/contracts/README.md) and earlier features; **no new keys** for 013  
**Testing**: Vitest (`pnpm test`); Playwright (`e2e/`, `playwright.config.ts` + `playwright.bootstrap.config.ts`; CI: Vitest → bootstrap E2E → `pnpm exec playwright test` which performs build + preview per config)  
**Target Platform**: Responsive web (pointer + touch); PWA offline core loop after first load  
**Project Type**: Single-package Vue SPA (recruitment / portfolio)  
**Performance Goals**: No regression to canvas interaction: keep **bounded redraw work** and avoid extra resize-driven full redraw storms; layout/CSS changes should not introduce layout thrash on `resize` (see `research.md`). Visual E2E: prefer **locator or viewport screenshots** over huge full-page files to keep CI artifact size reasonable.  
**Constraints**: Constitution — **HTML Canvas** remains the primary interactive board; English copy; Vitest before Playwright in CI  
**Scale/Scope**: Three routes (`/`, `/game`, `/briefcase`), incremental refactor (no rewrite), three baseline screenshots (+ optional mobile second viewport)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify alignment with `.specify/memory/constitution.md` (CS2 Memory Vue 3). All items MUST pass or be justified in **Complexity Tracking** below.

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind; exceptions documented with rationale.
- [x] **Canvas**: Playable memory grid (tiles, flip/reveal, hit testing) on HTML Canvas; pointer and touch; not DOM-as-primary game board.
- [x] **Performance**: Plan defines budgets above (layout/CSS + no canvas regression; visual test artifact discipline).
- [x] **Responsive + PWA + state**: Desktop and mobile; offline core loop after first load; installable PWA; persistent state client-side (`localStorage` keys documented in contracts; no new keys for 013).
- [x] **Tests**: TDD; P1 → `e2e/game-layout-balance.spec.ts` (or consolidated name); P2 → existing flows + Vitest for extracted pure helpers; P3 → `e2e/screens-visual.spec.ts` (or split files); see spec mapping.
- [x] **Assets**: One-time ingest from [ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API); local static assets; no runtime dependency on API/remote image hosts for core gameplay; attribution in repo README / prior specs.
- [x] **Copy + browsers**: English; matrix in [`research.md`](./research.md).
- [x] **Accessibility**: Pointer-first scope; no mandated screen-reader/WCAG unless constitution amended.
- [x] **Repo layout**: Single root `package.json`; Vitest + Playwright colocated (`e2e/`, `src/**/*.spec.ts`).
- [x] **Design**: No new Stitch deliverable required for 013; align with existing memo theme and prior UI specs (002/007/010). Reference Stitch only if a new export is produced during implementation.
- [x] **CI** (GitHub Actions): `.github/workflows/ci.yml` runs Install → Vitest → Playwright chromium → bootstrap → main Playwright (build+preview embedded) → Lint; new tests run in the main Playwright step unless scoped otherwise.
- [x] **Scope**: Recruitment/portfolio context in README / spec assumptions.

**Post-design re-check**: No violations; Complexity Tracking empty.

## Project Structure

### Documentation (this feature)

```text
specs/013-layout-refactor-e2e/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── views/               # HomeView.vue, GameView.vue, BriefcaseViewPage.vue
├── components/          # GameCanvasShell.vue, briefcase/*, ui/*
├── composables/
├── game/                # Pure layout, deal, canvas, storage helpers
├── stores/
├── constants/
└── audio/
e2e/                     # Playwright specs (add layout + visual specs)
public/tiles/            # Static tile images
```

**Structure Decision**: Single Vue SPA as above; changes concentrate on `GameView.vue` / shell wrapper layout, optional shared layout primitives, `composables/` and `game/` refactors, and new `e2e/*.spec.ts` files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0 — Research summary

Consolidated in [`research.md`](./research.md): Playwright screenshot strategy, viewport choices, deterministic `/game` URL, layout correction approach, CI integration.

## Phase 1 — Design artifacts

- [`data-model.md`](./data-model.md) — entities for screens, layout region, visual baselines (no persistence schema change).
- [`contracts/README.md`](./contracts/README.md) — E2E visual and layout test contract; storage unchanged.
- [`quickstart.md`](./quickstart.md) — how to run new tests and update snapshots locally.

## Phase 2 — Handoff (tasks)

`/speckit.tasks` should break work into: (1) failing-first layout assertions + CSS/markup fix, (2) refactor pass with green Vitest/Playwright, (3) screenshot baselines + `pnpm exec playwright test --update-snapshots` workflow documented, (4) confirm CI needs no YAML change if specs live under default `e2e/` config.
