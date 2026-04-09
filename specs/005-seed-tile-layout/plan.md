# Implementation Plan: Deterministic game seed (Briefcase)

**Branch**: `005-seed-tile-layout` | **Date**: 2026-04-08 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/005-seed-tile-layout/spec.md`

## Summary

The Briefcase seed field drives **deterministic initial deals** when the user supplies **exactly nine** digits (`xxx-xxx-xxx` mask): deal layout is a **pure function** of **`(difficulty, seedNine)`** using **FNV-1a + mulberry32** and the existing Fisher–Yates shuffle. **Briefcase → `/game`** passes **`seedNine`** via **`history.state.memoDealInit`**; **`GameCanvasShell`** consumes it once for a **new** deal, then clears history state. **Post–2026-04-08 clarify**: (1) **No tenth digit**—typing and paste **MUST** cap at nine digits. (2) **FR-006a**: With **`in_progress`**, navigating to **`/game`** **MUST** confirm abandon when **either** selected difficulty **≠** session difficulty (**FR-014**) **or** current **`briefcaseSeedRaw` ≠** the session’s **snapshot of the field at deal start** (including clear-to-empty vs a seeded start).

## Technical Context

**Language/Version**: TypeScript **5.7** (see root `package.json`), Node **22.x**  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), `vite-plugin-pwa`  
**Storage**: `localStorage` for in-progress snapshot + completed-session list (**004**); **`briefcaseSeedRaw`** not persisted for v1 unless product asks  
**Testing**: Vitest **3**, `@vue/test-utils`, Playwright **~1.49** (`e2e/`, bootstrap + preview configs)  
**Playwright authoring** (persistence timing, `goto` vs in-app nav, `data-deal-init` / snapshot restore): see **004** [`contracts/README.md`](../004-game-core-logic/contracts/README.md) § *Playwright / integration notes*.  
**Target Platform**: Responsive web (desktop + mobile); **PWA** with offline shell after first load  
**Project Type**: Single-page Vue app (recruitment / portfolio CS2 memory game)  
**Performance Goals**: Seed hash + shuffle for **n ≤ 32** pairs is sub-millisecond; mask normalizes per input event—no full-canvas impact  
**Constraints**: Determinism across **V8 / SpiderMonkey / JSC** for documented golden vectors; no runtime CSGO-API dependency  
**Scale/Scope**: One seed field, three difficulties, optional **E2E** hooks on `GameCanvasShell` (`data-deal-init`, `game-initial-identities`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind; no exceptions.
- [x] **Canvas**: Core grid remains HTML Canvas (**004**); seed only affects **initial** `identityIndex` assignment.
- [x] **Performance**: Hash + shuffle bounded; mask work per keystroke only.
- [x] **Responsive + PWA + state**: Unchanged; snapshot schema extension for **`dealBriefcaseSeedRaw`** remains client-only (`localStorage`).
- [x] **Tests**: Vitest for **`seedDeal`**, **`dealInitFromNavigation`**, Briefcase component; Playwright **`e2e/briefcase-seed-layout.spec.ts`** maps to US1–US3 + **SC-003** (tenth digit, long paste).
- [x] **Assets**: Local `public/tiles/*` + `tile-library.json`; unchanged.
- [x] **Copy + browsers**: English UI; matrix aligned with **004** / **`research.md` §5 (Chromium, Firefox, Safari via Playwright projects)**.
- [x] **Accessibility**: Pointer-first; seed field `inputmode="numeric"`.
- [x] **Repo layout**: Single root `package.json`; `src/**/*.spec.ts`, `e2e/` at repo root.
- [x] **Design**: Briefcase follows existing Stitch-themed UI; no new Stitch asset required for seed (**spec**).
- [x] **CI**: `pnpm test` → `vite build` → `vite preview` → Playwright (see `.github/workflows/` when present).
- [x] **Scope**: Non-commercial recruitment context (**README** / spec).

**Post-design re-check**: **FR-006a** extends **FR-014** with a **session field** and navigation guard—still canvas-first, client-only, test-mapped.

## Project Structure

### Documentation (this feature)

```text
specs/005-seed-tile-layout/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1 (seed-deal.contract.md)
└── tasks.md             # /speckit.tasks (not produced by this command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── briefcase/BriefcaseView.vue
│   └── GameCanvasShell.vue
├── composables/
│   ├── useBriefcaseNavigateToGame.ts
│   └── useNineDigitSeedMask.ts
├── constants/appCopy.ts
├── game/
│   ├── seedDeal.ts
│   ├── dealInitFromNavigation.ts
│   ├── memoryEngine.ts
│   └── memoryTypes.ts          # GameSession (+ dealBriefcaseSeedRaw per data-model)
├── stores/
│   ├── gameSettings.ts
│   ├── gamePlay.ts
│   └── gameSession.ts
├── views/
│   ├── BriefcaseViewPage.vue
│   └── GameView.vue
└── vite-env.d.ts               # HistoryState.memoDealInit

e2e/
├── briefcase-seed-layout.spec.ts
└── briefcase-view.spec.ts
```

**Structure Decision**: Single Vue SPA (**001** / **004** layout). Feature touches **game** pure modules, **Pinia**, **router history state**, and Briefcase + shell components only—no backend.

## Complexity Tracking

No constitution violations. **FR-006a** adds one optional string on **`GameSession`** and a compound condition in **`useBriefcaseNavigateToGame`** (same UX pattern as **FR-014**).

---

## Phase 0 — Research

**Output**: [`research.md`](./research.md) (updated §7 for **2026-04-08 clarify**).

## Phase 1 — Design artifacts

**Output**:

- [`data-model.md`](./data-model.md) — **`dealBriefcaseSeedRaw`** on **`GameSession`**, navigation guard truth table.
- [`contracts/seed-deal.contract.md`](./contracts/seed-deal.contract.md) — UI cap / typing rules.
- [`quickstart.md`](./quickstart.md) — manual steps for tenth-digit and seed-change / abandon parity.

**Agent context**: Run `.specify/scripts/bash/update-agent-context.sh cursor-agent` after edits.

## Phase 2 — Tasks (outline only)

Task breakdown lives in **`tasks.md`** via **`/speckit.tasks`**. Incremental work after this plan: implement **`dealBriefcaseSeedRaw`** (type + `beginSession` + snapshot migration), extend **`useBriefcaseNavigateToGame`**, enforce **tenth-digit** block in **`useNineDigitSeedMask`**, add Vitest/Playwright for **FR-005a** / **FR-006a**.
