# Implementation Plan: PWA offline persistence and install prompt (012)

**Branch**: `012-pwa-offline-install` | **Date**: 2026-04-09 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/012-pwa-offline-install/spec.md`

## Summary

Deliver **full offline-ready caching** for shell, **tile images**, and **SFX** (extend Workbox precache + optional font runtime cache); **persist briefcase/player settings** (`difficulty`, briefcase seed field text) across reloads via versioned **`localStorage`**; keep **in-progress / completed** session behavior on existing keys (**004**). Add a **bottom install sheet** (app-styled English copy) driven by **`beforeinstallprompt`** / **`appinstalled`** / **standalone** detection, with **versioned `localStorage`** to enforce **one automatic presentation cycle** per spec (**`pending` → `seen` → `dismissed` | `installed`** — see [`data-model.md`](./data-model.md)).

## Technical Context

**Language/Version**: TypeScript **5.7**, Node **22.x** (root `package.json`)  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), **`vite-plugin-pwa`** (Workbox)  
**Storage**: **`localStorage`** — existing **`memo-game.v1.inProgress`**, **`memo-game.v1.completedSessions`**; **new** **`memo-game.v1.playerSettings`**, **`memo-game.v1.pwaInstallUi`** ([`contracts/README.md`](./contracts/README.md)); **`sessionStorage`** **`memo-game.v1.reloadNewGameDifficulty`** unchanged (**006**)  
**Testing**: Vitest **3** (`src/**/*.spec.ts`), Playwright **~1.49** (`e2e/`, production preview on **4173**)  
**Target Platform**: Modern browsers — [`research.md`](./research.md) §8  
**Project Type**: SPA (Vue) — canvas-first game + DOM chrome  
**Performance Goals**: Settings / install state writes debounced or low-frequency; install sheet must not add perceptible jank to canvas input (hidden → `pointer-events: none` or unmounted)  
**Constraints**: Constitution canvas-first; English copy; no session snapshot **schemaVersion** bump (**FR-008**); graceful degrade when storage blocked  
**Scale/Scope**: Two new JSON documents, one Vue sheet + small composable/store, Workbox config extensions, **two** new E2E specs

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind.
- [x] **Canvas**: Game board unchanged; install UI is DOM overlay only.
- [x] **Performance**: Debounced persistence; sheet visibility/pointer policy in [`research.md`](./research.md) §9.
- [x] **Responsive + PWA + state**: Offline core loop enforced via precache + caching strategy; installable PWA already present — extended; all persistence client-side with keys documented.
- [x] **Tests**: Playwright **`e2e/pwa-persistence-offline.spec.ts`**, **`e2e/pwa-install-prompt.spec.ts`** per spec; Vitest for parse/hydrate helpers and prompt state logic.
- [x] **Assets**: Local `public/tiles`, `public/audio`; CSGO-API ingest unchanged; attribution in [`contracts/README.md`](./contracts/README.md).
- [x] **Copy + browsers**: English; matrix in [`research.md`](./research.md) §8.
- [x] **Accessibility**: Pointer-first; sheet dismiss + install targets touch-friendly where design allows.
- [x] **Repo layout**: Single root `package.json`; `e2e/` + Vitest colocated.
- [x] **Design**: No new Stitch mandate; reuse **`AppButton`** / dialog spacing tokens; optional Stitch pass later — not blocking plan.
- [x] **CI**: Existing Vitest → `vite build` → `vite preview` → Playwright flow; add new spec files to suite.
- [x] **Scope**: Non-commercial / portfolio context unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/012-pwa-offline-install/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── README.md
│   ├── player-settings.schema.json
│   └── pwa-install-ui.schema.json
└── tasks.md              # /speckit.tasks (not created by /speckit.plan)
```

### Source Code (repository root)

```text
vite.config.ts                    # Workbox globPatterns + runtimeCaching (fonts)
src/
├── game/
│   └── sessionConstants.ts       # NEW key exports for 012
├── stores/
│   └── gameSettings.ts           # hydrate + subscribe → persist (or dedicated module)
├── composables/                  # optional: usePwaInstallPrompt.ts
├── components/
│   └── pwa/                      # optional folder
│       └── PwaInstallSheet.vue   # bottom sheet UI
├── App.vue                       # mount sheet or layout wrapper
e2e/
├── pwa-persistence-offline.spec.ts
└── pwa-install-prompt.spec.ts
```

**Structure Decision**: Single-package Vue SPA; PWA logic colocated under **`src/components/pwa/`** and **`src/game/`** constants — adjust names to match existing naming if **`pwa/`** is avoided.

## Phase 0–1 outputs

| Artifact | Purpose |
|----------|---------|
| [`research.md`](./research.md) | Workbox, fonts, settings keys, install APIs, E2E approach |
| [`data-model.md`](./data-model.md) | `PlayerSettingsV1`, `PwaInstallUiStateV1`, transitions |
| [`contracts/`](./contracts/README.md) | Key names, schemas, query-vs-persistence note |
| [`quickstart.md`](./quickstart.md) | Manual + automated verification |

## Implementation notes

### Workbox / offline

1. Add **`mp3`** to **`globPatterns`** so **`public/audio/**`** precaches with the app shell.
2. Confirm **`png`** tiles remain precached (already in glob; verify build manifest includes `tiles/`).
3. Add **`runtimeCaching`** for **Google Fonts** hosts per [`research.md`](./research.md) §2 so offline sessions keep icon font loading after first online visit.

### Player settings persistence

1. Export new keys from **`sessionConstants.ts`** (or parallel module) — **must** match [`contracts/README.md`](./contracts/README.md).
2. On app init: **`safeParse`** → hydrate **`useGameSettingsStore`** if valid **`PlayerSettingsV1`**.
3. **`watch`** or store **`$subscribe`** with **~300ms** debounce: write **`difficulty`** + **`briefcaseSeedRaw`** only (exclude **`dealSeed`**).
4. **`GameView`** `applyRouteQuery`: after applying **`?difficulty` / `?seed`**, sync to persisted document per contract recommendation.

### Install sheet

1. **`beforeinstallprompt`**: `preventDefault()`, stash event ref for **`prompt()`** on Install click.
2. **Visibility gating**: not **standalone**; **`outcome === 'pending'`** only for *first* show; on open set **`seen`** in **`memo-game.v1.pwaInstallUi`**.
3. **Not now** → **`dismissed`**; **`appinstalled`** / standalone → **`installed`**.
4. **iOS / Firefox**: no event → no sheet; no errors ([`research.md`](./research.md) §5).
5. **Styling**: bottom **`fixed`** panel, app background/border/radius, **`AppButton`** or matching primitives, English strings in **`constants/appCopy`** (or colocated `pwaCopy`).

### Testing

- **Vitest**: JSON parse/validate helpers; transition table for install **`outcome`**; settings merge defaults.
- **Playwright**: settings reload test; optional **`localStorage`** assertion; offline test with **`context.setOffline(true)`** after SW ready; install test with **synthetic `BeforeInstallPromptEvent`** in **`page.evaluate`** where needed ([`research.md`](./research.md) §7).

## Complexity Tracking

None.
