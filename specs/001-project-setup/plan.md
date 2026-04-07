# Implementation Plan: Project Setup

**Branch**: `001-project-setup` | **Date**: 2026-04-07 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-project-setup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver a **greenfield** Vue 3 + TypeScript single-package repository: documented contributor bootstrap (README + `quickstart.md`), minimal **English** app shell, **Vitest** and **Playwright** wired with **TDD** discipline, **GitHub Actions** matching local order (Vitest → `vite build` → `vite preview` → Playwright), and **PWA** baseline (**vite-plugin-pwa** / Workbox) so the shell loads offline after first visit and is installable where supported. **Stitch** is not required for this milestone—neutral Tailwind shell.

Deferred to later features (justified in **Complexity Tracking**): playable **memory grid** on Canvas (Principle II); **offline core game loop** (Principle IV—this milestone validates offline **shell** and PWA plumbing only); full **CSGO-API** image ingest (README attribution and script hook only here).

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js **22.x** (LTS) for local and CI  
**Primary Dependencies**: Vue 3.5+, Vite 6+, Pinia, Tailwind CSS 4.x (or 3.x stable—lock in `research.md`), Vitest + `@vue/test-utils`, Playwright, `vite-plugin-pwa`  
**Storage**: N/A for server; client-only. Optional `localStorage` stub for future game state—not required for setup shell  
**Testing**: Vitest (unit/components); Playwright (E2E) colocated under `e2e/`  
**Target Platform**: Modern evergreen browsers + current Firefox ESR and Safari on latest two major macOS/iOS (see `research.md`)  
**Project Type**: Single-page web application (PWA)  
**Performance Goals**: Static shell for this feature—no animated Canvas loop yet; first contentful paint under **2s** on throttled “Fast 3G” for documented shell; **60 fps** reserved as target for game feature plans  
**Constraints**: **CI and quality-gate E2E** MUST use **`vite preview`** after `vite build`. **`e2e/project-setup/bootstrap.spec.ts`** MAY use **`vite dev`** to match README “Getting started” (local smoke only). English-only UI copy; offline shell after first load; no secrets in repo  
**Scale/Scope**: Recruitment portfolio; single maintainer workflow; CI on `ubuntu-latest`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify alignment with `.specify/memory/constitution.md` (CS2 Memory Vue 3). All items MUST pass or be justified in **Complexity Tracking** below.

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind; no exceptions.
- [x] **Canvas**: Playable memory grid **deferred**—see Complexity Tracking. Shell includes a **sized Canvas host** (`<canvas>`) as architectural placeholder for the next feature (no game logic).
- [x] **Performance**: Shell targets above; full frame budgets when game loop lands.
- [x] **Responsive + PWA + state**: Responsive layout; PWA via plugin; offline shell; persistent game state deferred (N/A for setup—documented in data model).
- [x] **Tests**: TDD; Playwright files `e2e/project-setup/*.spec.ts` per spec; Vitest for any extracted logic/components.
- [x] **Assets**: No gameplay images in this milestone; README documents CSGO-API provenance and one-time ingest for future work; shell has **no** runtime fetch to API/CDN.
- [x] **Copy + browsers**: English UI; matrix in `research.md`.
- [x] **Accessibility**: Pointer-first; no screen-reader mandate.
- [x] **Repo layout**: Single root `package.json`; `e2e/` + `playwright.config.ts` at root.
- [x] **Design**: Stitch **N/A** for setup; tokens in Tailwind only.
- [x] **CI**: `.github/workflows/ci.yml` — Vitest → build → preview → Playwright.
- [x] **Scope**: README states recruitment/portfolio + asset attribution.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-setup/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── package-scripts.json
├── spec.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
.github/workflows/ci.yml
e2e/project-setup/
├── bootstrap.spec.ts
├── quality-gates.spec.ts
└── pwa-shell.spec.ts
playwright.config.ts
public/
├── favicon.ico (optional)
└── (future: vendored game images)
index.html
package.json
pnpm-lock.yaml or package-lock.json
README.md
tsconfig.json
tsconfig.node.json
vite.config.ts
vitest.config.ts
src/
├── App.vue
├── main.ts
├── style.css
├── components/
│   └── GameCanvasShell.vue   # sized canvas placeholder; game logic later
├── stores/
│   └── index.ts              # Pinia bootstrap (empty or demo)
└── __tests__/                # optional Vitest colocated or src/**/*.spec.ts
tailwind.config.js            # or .ts / @tailwind v4 postcss as generated
postcss.config.js             # if required by Tailwind setup
eslint.config.js              # optional but recommended
```

**Structure Decision**: Single Vite + Vue app at repository root per constitution; tests colocated (`src/**/*.spec.ts`, `e2e/`).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|----------------------------------------|
| Principle II not fully met (no playable memory grid) | Setup milestone scaffolds repo and PWA/tests only; game board is a separate feature spec. | Omitting Canvas entirely would push integration risk to the first game PR; a **Canvas shell** proves sizing/DPR wiring early. |
| Full CSGO-API image ingest not implemented | FR-008 satisfied by README attribution + documented follow-up; shell needs no card art. | Shipping ingest in the same PR as tooling would blur scope and slow review. |
| Principle IV “core game loop” offline | Constitution targets the full **memory game**; this feature only proves **offline English shell** + SW precache. Full loop offline is verified when the board feature ships. | Claiming full compliance now would be misleading; shell is the honest incremental slice. |

## Phase 2

Tasks for this feature are produced by `/speckit.tasks` (`tasks.md`).
