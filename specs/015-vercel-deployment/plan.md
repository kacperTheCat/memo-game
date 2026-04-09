# Implementation Plan: Hosted deployment and hidden game debug control (015)

**Branch**: `015-vercel-deployment` | **Date**: 2026-04-09 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/015-vercel-deployment/spec.md`

## Summary

Tighten **debug “show all faces”** visibility so it appears only for **Vite development bundles served on a loopback hostname**, closing cases like **`vercel dev`** or tunnels where `import.meta.env.DEV` is true but the URL is not local. **Deploy** the SPA to **Vercel** (Node 22, `pnpm build` → `dist`) and verify deep links + PWA over HTTPS. Add **Playwright** coverage: button **absent** on **preview** build (main config), **present** on **dev** server (bootstrap config); **Vitest** for hostname helper logic.

## Technical Context

**Language/Version**: TypeScript **5.7**, Node **22.x** (root `package.json` `engines`)  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), **`vite-plugin-pwa`**  
**Storage**: N/A for this feature — no new client persistence ([`data-model.md`](./data-model.md))  
**Testing**: Vitest **3** (`src/**/*.spec.ts`), Playwright **~1.49** (`e2e/`, preview on **127.0.0.1:4173**; dev on **127.0.0.1:5173** for bootstrap)  
**Target Platform**: Static SPA on **Vercel** (HTTPS); local dev + CI as today  
**Project Type**: Vue SPA — canvas-first game + DOM chrome  
**Performance Goals**: Hostname check at setup only; no change to canvas frame budget ([`research.md`](./research.md) §7)  
**Constraints**: Constitution canvas-first; English copy; PWA/offline behavior unchanged except hosting URL  
**Scale/Scope**: One pure helper module, small `GameCanvasShell` change, optional root **`vercel.json`**, two E2E files + Vitest, Vercel project wiring (dashboard + docs)

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind.
- [x] **Canvas**: No change to canvas architecture; debug control is DOM-only.
- [x] **Performance**: No per-frame work added; noted in [`research.md`](./research.md).
- [x] **Responsive + PWA + state**: PWA remains client-side; hosting is static + HTTPS; no new persistence keys ([`contracts/README.md`](./contracts/README.md)).
- [x] **Tests**: Playwright for preview (hidden) + dev (visible); Vitest for hostname rule — mapped in [`research.md`](./research.md) §4.
- [x] **Assets**: Unchanged; local `public/tiles`, `public/audio`; attribution in contracts README.
- [x] **Copy + browsers**: English; CI Chromium; manual matrix in [`research.md`](./research.md) §6.
- [x] **Accessibility**: Pointer-first; button unchanged when shown.
- [x] **Repo layout**: Single root `package.json`; `e2e/` + Vitest colocated.
- [x] **Design**: No Stitch change; debug control is existing amber button.
- [x] **CI**: Keep Vitest → Playwright bootstrap (dev) → build + Playwright preview → lint ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)); new specs picked up automatically when files match config `testMatch` / `testDir`.
- [x] **Scope**: Recruitment/portfolio context unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/015-vercel-deployment/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── README.md        # Deployment + debug UI contract
└── tasks.md             # /speckit.tasks (not created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── env/                          # NEW (or existing util folder per repo taste)
│   └── showGameDebugPeekUi.ts    # DEV + loopback helper + isLoopbackHostname
├── components/
│   └── GameCanvasShell.vue       # use helper instead of raw import.meta.env.DEV
e2e/
├── game-debug-peek-visibility.spec.ts   # preview: button absent
project-setup/
└── game-debug-peek-dev.spec.ts          # dev: button present (bootstrap config)
playwright.bootstrap.config.ts    # extend testMatch to include new dev spec
vercel.json                       # OPTIONAL — only if SPA deep-link 404s on Vercel
README.md                         # short “Deploy to Vercel” pointer → quickstart
```

**Structure Decision**: Single-package Vue SPA; keep deployment docs in feature **`quickstart.md`**; minimal root **`vercel.json`** only if required after first deploy smoke.

## Phase 0–1 outputs

| Artifact | Purpose |
|----------|---------|
| [`research.md`](./research.md) | DEV+tunnel gap, Vercel notes, E2E split, loopback rule |
| [`data-model.md`](./data-model.md) | Runtime visibility classification; no new persistence |
| [`contracts/README.md`](./contracts/README.md) | Debug testid rule + Vercel settings table |
| [`quickstart.md`](./quickstart.md) | Local + Vercel verification |

## Implementation notes

### Debug peek visibility

1. Add **`isLoopbackHostname(hostname: string): boolean`** and **`showGameDebugPeekUi(): boolean`** (`import.meta.env.DEV && (SSR guard) && isLoopbackHostname(window.location.hostname)`).
2. In **`GameCanvasShell.vue`**, set `showDebugPeekButton` from **`showGameDebugPeekUi()`** (or a `computed` that reads it once per navigation if needed for rare client-only navigation edge cases — usually constant per load).
3. **Vitest**: table-driven tests for **`isLoopbackHostname`**; optionally mock `import.meta.env` only if the project already uses that pattern.

### Vercel

1. Connect repo; set **Node 22**; **Install** `pnpm install`, **Build** `pnpm build`, **Output** `dist`.
2. After first deploy, test cold load **`/game`** and **`/briefcase`**; add **`vercel.json`** rewrites only if required ([`contracts/README.md`](./contracts/README.md)).
3. Optionally document production URL in README (non-secret).

### Testing

1. **`e2e/game-debug-peek-visibility.spec.ts`**: navigate to `/game`, `expect(locator).toHaveCount(0)` for **`game-debug-peek-faces`** (or `not.toBeVisible()` if attached checks differ).
2. **`e2e/project-setup/game-debug-peek-dev.spec.ts`**: same testid **visible** on dev server.
3. Update **`playwright.bootstrap.config.ts`** `testMatch` to include **`game-debug-peek-dev.spec.ts`** (keep **`bootstrap.spec.ts`**).
4. **`GameCanvasShell.spec.ts`**: if tests assumed `import.meta.env.DEV`, align stubs with the new helper.

## Complexity Tracking

None.
