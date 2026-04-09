# Implementation Plan: Styles improvements (ambient visuals) (010)

**Branch**: `010-styles-improvements` | **Date**: 2026-04-09 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/010-styles-improvements/spec.md`

## Summary

Ship **ambient visuals** across Home, Briefcase, Win debrief, and the **canvas** game board: **cloud-chasing** cursor spotlight (**below** foreground UI), **mouse idle fade-out**, **touch-only** spotlight while contact is active, **cursor-reactive** gradients on **revealed** tiles, **smoke-like** yellow ambience on Briefcase, **staggered “Operation Complete”** entrance, and **subtle animated grain** on Home + Briefcase. **No** new persistence or routes ([`data-model.md`](./data-model.md)).

**Technical approach:** Vue **composables** + **rAF** for smoothed pointer targets and **visibility/opacity envelope**; **`MemoAmbientSpotlight.vue`** (or equivalent) binds CSS variables / opacity. Canvas path extends existing **`GameCanvasShell`** / **`canvasTileDraw`** for face gradients. Constants for idle threshold and fade durations live beside **`useAmbientChaseLight`** ([`research.md`](./research.md) §1–2).

## Technical Context

**Language/Version**: TypeScript **5.7**, Node **22.x** (root `package.json`)  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), `vite-plugin-pwa`  
**Storage**: N/A for this feature (no new `localStorage` keys)  
**Testing**: Vitest **3** (`src/**/*.spec.ts`), Playwright **~1.49** (`e2e/`)  
**Target Platform**: Modern browsers (Chromium, Firefox, Safari)—[`research.md`](./research.md) §9  
**Project Type**: SPA (Vue) — canvas-first game board; DOM ambient layers  
**Performance Goals**: **~60 fps** perceived on mid-tier laptop for rAF-driven layers; **≤1 combined rAF** per view where practical ([`research.md`](./research.md) §8)  
**Constraints**: Constitution canvas-first board; English copy; PWA offline core after first load  
**Scale/Scope**: Five user stories (P1–P3); five Playwright specs mapped in spec

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind.
- [x] **Canvas**: Game board remains HTML Canvas; this feature only **augments** draw + shell pointer tracking.
- [x] **Performance**: Spec SC + `research.md` §8 define animation / rAF budgets.
- [x] **Responsive + PWA + state**: No new persistence; client state unchanged.
- [x] **Tests**: Each user story lists Playwright path in spec; Vitest for pure math/components.
- [x] **Assets**: Local tiles unchanged; no new remote hosts.
- [x] **Copy + browsers**: English; matrix in `research.md` §9.
- [x] **Accessibility**: Pointer-first; `prefers-reduced-motion` gates motion (FR-009).
- [x] **Repo layout**: Single root `package.json`; `e2e/` + Vitest colocated.
- [x] **Design**: Stitch optional; spec references design intent.
- [x] **CI**: Vitest → `vite build` → preview → Playwright when workflow present.
- [x] **Scope**: Non-commercial / portfolio context in README & spec.

## Project Structure

### Documentation (this feature)

```text
specs/010-styles-improvements/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ambient-ui.md
├── checklists/
└── tasks.md              # /speckit.tasks (regenerate if plan delta requires new tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ambient/
│   │   └── MemoAmbientSpotlight.vue
│   ├── GameCanvasShell.vue
│   ├── WinDebriefPanel.vue
│   ├── hub/
│   │   └── HubGrainLayer.vue
│   └── briefcase/
│       └── BriefcaseViewPage.vue
├── composables/
│   └── useAmbientChaseLight.ts
├── game/
│   ├── ambientPointerMath.ts
│   ├── canvasTileDraw.ts
│   ├── tileFaceGradientPointer.ts   # or merged helpers
│   └── briefcaseAmbienceTargets.ts
├── views/
│   ├── HomeView.vue
│   └── BriefcaseViewPage.vue
e2e/
├── styles-spotlight-depth.spec.ts
├── styles-game-card-gradient.spec.ts
├── styles-briefcase-ambience.spec.ts
├── styles-operation-complete-text.spec.ts
└── styles-grain-motion.spec.ts
```

**Structure Decision**: Single-package Vue SPA; presentation logic in composables + thin view wiring; canvas drawing stays under `src/game/`.

## Phase 0–1 outputs

| Artifact | Purpose |
|----------|---------|
| [`research.md`](./research.md) | Spotlight chase, **idle fade**, **touch-only** visibility, canvas gradient, grain, reduced motion |
| [`data-model.md`](./data-model.md) | Ephemeral spotlight / opacity / touch-active flags |
| [`contracts/ambient-ui.md`](./contracts/ambient-ui.md) | `data-testid` + **observable opacity / visibility** for E2E |
| [`quickstart.md`](./quickstart.md) | Dev, tests, manual idle + touch checks |

## Implementation notes

### US1 — Ambient spotlight (FR-001a / FR-001b / FR-001c, SC-006–SC-009)

1. **Input classification:** Prefer **Pointer Events** where possible: `pointerType === 'mouse'` (and optionally `'pen'` when not primary touch) → **mouse path**; `pointertype === 'touch'` → **touch path**. Supplement with `touchstart` / `touchend` / `touchcancel` if needed so **active touch count** is authoritative on hybrid devices.
2. **Mouse — chase + idle fade:** On `pointermove` (mouse), update target and set **visibility envelope** to full. Start **idle timer** (~**400 ms** after last mouse move—tunable). When idle fires, **lerp or transition opacity** from **1 → 0** over ~**300–400 ms** (ease-out). On next mouse move, ramp opacity back up over **~380–450 ms** (gentle fade-in; current implementation **420 ms**) before/at same time as chase updates.
3. **Touch — contact only:** While **at least one touch** is active, show spotlight (same chase toward primary touch point). On **last finger lift** (`touchend` / `touchcancel` when `touches.length === 0`), **fade out quickly** (~**150–250 ms**) or hide; **do not** hold last position after release (FR-001b).
4. **Reduced motion:** When `prefers-reduced-motion: reduce`, keep FR-009: spotlight **static dim or off**, minimal drift, **no wind stretch** (FR-001c off).
5. **Viewport layer:** `MemoAmbientSpotlight` uses **`position: fixed; inset: 0`** so **%** positioning tracks **visual viewport** (`clientX` / `clientY`) even when `document` is wider than the viewport (overflow / wide tables). Optional hooks **`data-memo-spotlight-vp-x` / `data-memo-spotlight-vp-y`** (0–100 integers) support E2E regression.
6. **Wind-shaped cloud (FR-001c):** Derive **smoothed velocity** from chase output; map to **ellipse axis rotation + mild anisotropic scale** on the gradient blob; scale strength by **envelope**; zero under reduced motion.
7. **E2E:** Expose **`data-ambient-spotlight-active`** (`"true"` \| `"false"`) or document **computed opacity** threshold on `[data-testid="ambient-spotlight"]`** root for idle (mouse) checks. Touch scenarios: **Playwright project with `hasTouch: true`** or documented manual SC-008; automated touch optional if flaky.

### US2 — Card gradient (FR-003 / FR-004)

1. Normalize pointer vs each **revealed** face rect; **lerp** gradient focal params in shell or draw helper.  
2. Avoid strobing on rapid moves (existing settle / lerp patterns).  
3. E2E: custom properties or stable attributes on shell as in [`contracts/ambient-ui.md`](./contracts/ambient-ui.md).

### US3 — Briefcase yellow ambience (FR-005 / FR-006)

1. rAF-smoothed blob targets; same z-order band as spotlight under `z-10` content.  
2. Playwright: presence + optional style snapshots per `e2e/styles-briefcase-ambience.spec.ts`.

### US4 — Operation Complete (FR-007, SC-002)

1. Per-character spans; stagger via CSS delays or controlled class toggles; complete within **2 s** of visible.  
2. **Gradient + `background-clip: text`:** avoid parent clip hiding animated children—use **per-glyph** gradient or non-clipping wrapper if letters vanish (known risk from analysis).  
3. E2E: span count + timing; prefer assertions that characters become **visible** (e.g. `innerText` / opacity), not only span count.

### US5 — Grain (FR-008, SC-004)

1. CSS `@keyframes` on `background-position` (or equivalent) on `HubGrainLayer`; respect reduced motion.

## Complexity Tracking

None.
