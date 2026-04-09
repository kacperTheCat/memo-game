---
description: Task list for 001-project-setup (greenfield Vue PWA shell)
---

# Tasks: Project Setup

**Input**: Design documents from `/specs/001-project-setup/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/package-scripts.json](./contracts/package-scripts.json), [quickstart.md](./quickstart.md)

**Tests**: Mandatory per `.specify/memory/constitution.md` — write **Vitest** and **Playwright** tasks **before** matching implementation in each user-story phase; keep red until implementation satisfies acceptance scenarios.

**Organization**: Phases follow spec priorities P1 → P2 → P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallel when different files and no ordering dependency within the phase
- **[Story]**: `[US1]` / `[US2]` / `[US3]` only on user-story phase tasks

## Path Conventions

Single package at repo root: `src/`, `e2e/project-setup/`, `playwright.config.ts`, `.github/workflows/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repository skeleton and toolchain files before app code.

- [x] T001 Add `package.json` with `engines.node` ^22, `packageManager` (pnpm), and dependency placeholders per [plan.md](./plan.md)
- [x] T002 [P] Add `.nvmrc` containing `22` at repository root
- [x] T003 [P] Add `index.html` at repository root referencing `/src/main.ts`
- [x] T004 [P] Add `tsconfig.json` and `tsconfig.node.json` for Vue + Vite strict mode
- [x] T005 [P] Add `vite.config.ts` with Vue plugin and `@` alias to `src/` if used

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Minimal runnable Vue shell so browsers and test runners can attach. **No user story complete until this phase is done.**

**⚠️ CRITICAL**: User story phases must not start until T012 completes.

- [x] T006 Install and wire Vue 3 + `src/main.ts` mounting the root app with **Pinia** registered using `src/stores/index.ts` (export `pinia` instance; empty store modules OK)
- [x] T007 [P] Add `src/App.vue` with a single English heading placeholder (replace with spec copy in US1)
- [x] T008 [P] Add `src/components/game/GameCanvasShell.vue` with explicit canvas dimensions (CSS + attributes) per [data-model.md](./data-model.md)
- [x] T009 [P] Add Tailwind (`tailwind.config.*`, `postcss.config.js` if required) and `src/style.css` entry imported from `main.ts`
- [x] T010 [P] Add `vitest.config.ts`, `@vue/test-utils`, and `src/test/setup.ts` (or inline) with **happy-dom** / **jsdom**
- [x] T011 Integrate `GameCanvasShell` into `App.vue` with responsive layout (min width ~320px)
- [x] T012 [P] Add `src/constants/appCopy.ts` exporting English `documentTitle` and `primaryHeading` strings; import placeholders in `App.vue` (final copy locked in US1 T016)

**Checkpoint**: `pnpm dev` serves a page with English placeholder and visible canvas host.

**Note**: T012 is **foundational copy scaffolding** so T013+ E2E/Vitest can assert against a **single source of truth** (avoids drift before `appCopy.spec.ts`).

---

## Phase 3: User Story 1 — First-time developer bootstrap (Priority: P1) 🎯 MVP

**Goal**: Documented clone → install → dev server; English shell visible; Playwright + Vitest prove it.

**Independent Test**: Follow [quickstart.md](./quickstart.md) bootstrap; browser shows English UI without blocking errors.

### Tests for User Story 1 (write first, expect FAIL then GREEN)

- [x] T013 [P] [US1] Add `e2e/project-setup/bootstrap.spec.ts` asserting root URL loads and visible text matches strings imported from `src/constants/appCopy.ts` (use `playwright.config.ts` **dev** `webServer` for this file or project dependency)
- [x] T014 [P] [US1] Add `src/components/game/GameCanvasShell.spec.ts` asserting component mounts and `<canvas>` exists with expected size attributes

### Implementation for User Story 1

- [x] T015 [US1] Set `document` title and `App.vue` copy to final English strings in `src/constants/appCopy.ts` per [spec.md](./spec.md) FR-002 and [data-model.md](./data-model.md)
- [x] T016 [US1] Add `README.md` section “Getting started” (FR-001) linking to [quickstart.md](./quickstart.md) and listing Node 22 + pnpm/npm; add bullets for **unsupported Node**, **interrupted install retry**, and **first visit offline** per [spec.md](./spec.md) edge cases
- [x] T017 [US1] Align `playwright.config.ts` so `bootstrap.spec.ts` runs against documented dev server (`vite` command)

**Checkpoint**: US1 Playwright + Vitest green locally.

---

## Phase 4: User Story 2 — Repeatable automated checks (Priority: P2)

**Goal**: Scripts + Playwright against **`vite preview`** + GitHub Actions order: Vitest → build → preview → Playwright.

**Independent Test**: `pnpm test && pnpm build && pnpm preview` + `pnpm test:e2e` (or composite) matches [contracts/package-scripts.json](./contracts/package-scripts.json).

### Tests for User Story 2 (write first)

- [x] T018 [P] [US2] Add `e2e/project-setup/quality-gates.spec.ts` hitting **preview** baseURL only; smoke: English shell visible (maps spec acceptance 1–2 for preview path)
- [x] T019 [P] [US2] Add `src/constants/appCopy.spec.ts` Vitest for exported English strings (must stay in sync with UI)

### Implementation for User Story 2

- [x] T020 [US2] Implement `package.json` scripts `dev`, `build`, `preview`, `test`, `test:e2e` per [contracts/package-scripts.json](./contracts/package-scripts.json)
- [x] T021 [US2] Update `playwright.config.ts` with separate **preview** webServer (`vite build` then `vite preview` on port **4173**) for default / quality-gates project; keep dev server config scoped to bootstrap project if using `projects` array
- [x] T022 [US2] Add `.github/workflows/ci.yml` on `ubuntu-latest` with Node 22: `pnpm test` → bootstrap Playwright → full Playwright (preview `webServer` runs `vite build` + `vite preview`; install browsers with `playwright install --with-deps`)
- [x] T023 [US2] Extend `README.md` with “Automation & CI” mirroring workflow commands

**Checkpoint**: Local preview-based E2E green; CI workflow passes on a clean branch.

---

## Phase 5: User Story 3 — Installable and offline-ready shell (Priority: P3)

**Goal**: PWA registration, offline shell after first load, manifest + icons; E2E covers SW + offline revisit.

**Independent Test**: Online first load, then offline navigation still shows English shell (see [quickstart.md](./quickstart.md) PWA section).

### Tests for User Story 3 (write first)

- [x] T024 [P] [US3] Add `e2e/project-setup/pwa-shell.spec.ts` asserting service worker active (or waiting) after load; after `context.setOffline(true)`, perform **three** full page reloads in a row—each time English shell from `appCopy` remains visible (Chromium; maps [spec.md](./spec.md) SC-003 sample)

### Implementation for User Story 3

- [x] T025 [US3] Add `vite-plugin-pwa` to `vite.config.ts` with `registerType: 'autoUpdate'` and precache strategy per [research.md](./research.md)
- [x] T026 [US3] Add `public/` PWA icons and manifest fields (`name`, `short_name`, `start_url`, `display`) per [data-model.md](./data-model.md)
- [x] T027 [US3] Document install / offline verification in `README.md` (and cross-link [quickstart.md](./quickstart.md)); state **manual** add-to-home-screen smoke per [spec.md](./spec.md) US3 note

**Checkpoint**: US3 Playwright green; manual install smoke on one target browser documented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Attribution, optional tooling, consistency.

- [x] T028 [P] Add `README.md` non-commercial recruitment context plus CSGO-API attribution and future `ingest:assets` note (FR-008; no live API dependency for shell)
- [x] T029 [P] Add `scripts/README.md` or stub `scripts/ingest-assets.mjs` documenting one-time asset pipeline placeholder
- [x] T030 [P] Add optional `eslint.config.js` + lint script if desired for reviewer expectations
- [x] T031 Verify [quickstart.md](./quickstart.md) steps against a clean clone and fix doc drift (include rough **SC-001** timing sanity if possible)
- [x] T032 [P] Record one **FCP** check for the shell (DevTools Performance or Lighthouse once) against [plan.md](./plan.md) target (under 2s on throttled Fast 3G); add optional command or note to `README.md` / [quickstart.md](./quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3 (US1)** → **Phase 4 (US2)** → **Phase 5 (US3)** → **Phase 6**
- US2 depends on US1 shell existing; US3 depends on preview/E2E harness from US2

### User Story Dependencies

- **US1**: After Phase 2 only
- **US2**: After US1 (preview tests assume stable shell)
- **US3**: After US2 (reliable CI/preview pattern); PWA layers on same shell

### Within Each User Story

- Playwright + Vitest tasks before implementation tasks
- Config (`playwright.config.ts`, `vite.config.ts`) updates after failing tests are written

### Parallel Opportunities

- T002–T005, T007–T010, T013–T014, T018–T019, T024 after prior phase complete
- T028–T030 and T032 in Phase 6

---

## Parallel Example: User Story 1

```bash
# Together after Phase 2:
Task: "e2e/project-setup/bootstrap.spec.ts"   # T013
Task: "src/components/game/GameCanvasShell.spec.ts" # T014
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 + Phase 2  
2. Complete Phase 3 (US1)  
3. **STOP**: Demo clone → install → dev → green US1 tests  

### Incremental Delivery

1. Add US2 → CI green  
2. Add US3 → offline/install documented  

### Suggested MVP Scope

**User Story 1** delivers minimum reviewable value (runnable English shell + docs + first E2E).

---

## Summary

| Metric | Value |
|--------|--------|
| **Total tasks** | 32 |
| **US1** | 5 (2 test + 3 impl) |
| **US2** | 6 (2 test + 4 impl) |
| **US3** | 4 (1 test + 3 impl) |
| **Setup + Foundational** | 12 |
| **Polish** | 5 |

**Format validation**: All tasks use `- [x] Tnnn ...` with file paths in descriptions where applicable; story labels only on Phases 3–5.
