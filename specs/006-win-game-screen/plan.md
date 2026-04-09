# Implementation Plan: Post-Match Win Screen

**Branch**: `006-win-game-screen` | **Date**: 2026-04-08 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/006-win-game-screen/spec.md`

**Note**: Filled by `/speckit.plan`. Template workflow: `.specify/templates/plan-template.md`.

## Summary

Deliver a **post-match win debrief** on **`/game`** (no URL change): after **`won`**, replace the canvas board with a **Stitch-aligned** debrief (gold ambient + grain, liquid-glass stats, **History Ledger**). **Play Again** starts a new deal at the **same difficulty**. **FR-013 / FR-014 (2026-04-08 clarify):** a **full reload** while the debrief is showing must land on a **new active game** (Play Again–equivalent); **any navigation to `/briefcase`** must **clear win debrief presentation state** so **`/game`** never shows an orphan debrief without a **fresh** win. Proof: **`e2e/win-game-screen.spec.ts`** with **seeded** RNG plus Vitest for formatters / panel logic.

## Technical Context

**Language/Version**: TypeScript **5.7** (see root `package.json`), Node **22.x**  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), `vite-plugin-pwa`  
**Storage**: **`localStorage`** versioned keys (**004**): `memo-game.v1.completedSessions`, `memo-game.v1.inProgress`; no new **localStorage** key for 006 v1. **FR-013:** tab-scoped **`sessionStorage`** key **`memo-game.v1.reloadNewGameDifficulty`** (see `src/game/storage/reloadNewGameDifficulty.ts`) holds the completed round’s **difficulty** only until the next fresh deal on **`/game`** or until cleared on Play Again / Return / briefcase navigation—**not** a “debrief visible” flag.  
**Testing**: Vitest **3**, Playwright **1.49**, `@vue/test-utils`  
**Target Platform**: Modern browsers (Chromium in CI; manual Firefox/Safari on preview)—see [`research.md`](./research.md) §7  
**Project Type**: Single-package **responsive PWA** (Vue SPA)  
**Performance Goals**: Debrief is DOM/CSS + static table; canvas idle while debrief visible. Interaction: **≤100 ms** perceived for **Play Again** / **Return to Briefcase** (no heavy sync work on main thread).  
**Constraints**: Offline-capable after first load; English UI; canvas remains primary **gameplay** surface when board is shown  
**Scale/Scope**: One in-route debrief view; history **N** rows 0–10+; no server

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind; no exceptions.
- [x] **Canvas**: Playable grid stays on **HTML Canvas** in **`GameCanvasShell`** when board mode is active; debrief is separate DOM view on same route.
- [x] **Performance**: Budgets stated above for debrief actions; canvas perf unchanged from **004**.
- [x] **Responsive + PWA + state**: Desktop/mobile; PWA; durable state client-side via **`localStorage`** (named); **006 FR-013** uses **`sessionStorage`** only for reload→same-difficulty new deal (see Technical Context).
- [x] **Tests**: User stories map to **`e2e/win-game-screen.spec.ts`** + Vitest specs; **FR-012** full-path **`/game`** → win → debrief; **SC-006** adds reload + briefcase→`/game` checks when implemented.
- [x] **Assets**: CS2 tiles local under **`public/`**; ingest documented in **003/004**; no runtime CSGO-API dependency for gameplay.
- [x] **Copy + browsers**: English; matrix in **`research.md`** §7.
- [x] **Accessibility**: Pointer-first per constitution.
- [x] **Repo layout**: Single root **`package.json`**; **`e2e/`** + **`playwright*.config.ts`** at repo root.
- [x] **Design**: Stitch refs in [`spec.md`](./spec.md) and **`designs/.../inspection_summary_history/`**.
- [x] **CI**: When present, Vitest → **`vite build`** → **`vite preview`** → Playwright (see `.github/workflows/`).
- [x] **Scope**: Non-commercial / portfolio context in README/spec assumptions.

## Project Structure

### Documentation (this feature)

```text
specs/006-win-game-screen/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # Phase 2 (/speckit.tasks — not produced by this command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── GameCanvasShell.vue      # Win flow, emits won; board vs debrief orchestration parent
│   ├── WinDebriefPanel.vue      # Debrief UI (glass, ledger, actions)
│   └── briefcase/               # Hub (navigation target for FR-014)
├── views/
│   ├── GameView.vue             # /game: toggles board vs WinDebriefPanel
│   └── BriefcaseViewPage.vue    # /briefcase wrapper
├── stores/
│   ├── gameSession.ts           # Session lifecycle, finalize, completed list, debrief-related cleanup
│   └── gameSettings.ts        # Difficulty, optional deal seed
├── game/
│   ├── seededRng.ts                 # Deterministic deal for tests
│   ├── reloadNewGameDifficulty.ts   # FR-013: sessionStorage difficulty for reload-on-debrief
│   ├── winDebriefFormat.ts          # MM:SS, YYYY-MM-DD, labels
│   └── winDebriefHistory.ts         # won-only ledger projection
├── router/index.ts              # /, /game, /briefcase
├── constants/appCopy.ts         # English strings
└── composables/                 # Navigation helpers as needed

e2e/
└── win-game-screen.spec.ts      # Seeded full path + SC-006 scenarios
```

**Structure Decision**: Single Vue SPA (**memo-game**); feature touches **`GameView`** (sets/clears reload difficulty on **won** / Play Again / Return), **`GameCanvasShell`** (**`consumeReloadNewGameDifficulty()`** in **`initRoundIfNeeded`**), **`WinDebriefPanel`**, **`router/index.ts`** (**`beforeEach`** on **`briefcase`** for **won**), **`gameSession`** store, and **`e2e/win-game-screen.spec.ts`**. **FR-013** is enforced by **not** restoring debrief after reload and by starting a **new deal** at the **stored difficulty** (Play Again–equivalent). **FR-014** is enforced by clearing **won** session + **`play.memory`** + reload key when entering **`/briefcase`**—see [`research.md`](./research.md) §9.

## Phase 0: Research

**Status:** Complete — see [`research.md`](./research.md).  
**2026-04-08 update:** §2 and §8 revised; **§9** added for **reload-on-debrief** and **briefcase clears debrief mode** (**FR-013**, **FR-014**).

## Phase 1: Design & Contracts

**Artifacts:**

| Artifact | Path |
|----------|------|
| Data model | [`data-model.md`](./data-model.md) |
| Contracts | [`contracts/README.md`](./contracts/README.md) |
| Quickstart | [`quickstart.md`](./quickstart.md) |

**Agent context:** Run `.specify/scripts/bash/update-agent-context.sh cursor-agent` after updating this plan (executed as part of `/speckit.plan`).

## Phase 2: Implementation Tasks

**Not generated by `/speckit.plan`.** Use **`/speckit.tasks`** to refresh **`tasks.md`** with work items for **FR-013**, **FR-014**, and **SC-006** (store + router + Playwright).

## Complexity Tracking

No constitution violations; table intentionally empty.
