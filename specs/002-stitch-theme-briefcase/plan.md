# Implementation Plan: Stitch-Referenced Theme and The Briefcase View

**Branch**: `002-stitch-theme-briefcase` | **Date**: 2026-04-07 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-stitch-theme-briefcase/spec.md` (clarifications: canvas on **`/game`** only; **home** = **DOM** main entry; **FR-008** / **FR-009**; **FR-010** Main Menu chrome; **Session 2026-04-07 — 2** — **`designs/.../the_briefcase_main_menu/`** is the **mandatory** visual source for **FR-002** / **FR-010**; **Session 2026-04-07 — 3** — **difficulty** MUST be **three** **tile**-style **radio** options per **`code.html`**, not a **`<select>`**.)

**Note**: Filled by `/speckit.plan`. Template workflow: `.specify/templates/plan-template.md`.

## Summary

Ship **The Briefcase** as an English-only **Vue** screen whose **palette**, **glass**, **backdrop**, **radii**, and **primary CTA** treatment **match** the **version-controlled** exports at **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/`** (`code.html` for **token values** and **CSS patterns**; **`screen.png`** for **SC-001** visual parity). **Stitch MCP** is **optional** for extra IDs only—**no drift** from those files (**spec FR-002**).

**Home** (`/`) = **DOM** landing, **no** canvas. **Tiles** on **`/game`** via **`GameCanvasShell`**. **Briefcase** implements **FR-010** (difficulty **tiles**, glass, Unlock showcase stub, seed, page backdrop) as **DOM/CSS** with **`prefers-reduced-motion`** fallbacks.

**FR-010(a)**: **Three** **radio-card** / **tile** options (**Easy**, **Medium**, **Hard**) in a **fieldset** (or **ARIA**-equivalent) with **keyboard** support—**layout** and **selected-state** styling aligned to **`code.html`** (grid `grid-cols-1 md:grid-cols-3`, **border-glass**, **bg-white/5**, **primary** accent on selected). A **`<select>`** MUST **not** be the primary control.

Map design tokens through **Tailwind CSS v4** `@theme` / CSS variables in **`src/style.css`** (and component classes in **`BriefcaseViewPage.vue`**, **`BriefcaseGlassPanel.vue`**, **`BriefcaseView.vue`**).

**Playwright** `e2e/briefcase-view.spec.ts` covers **P1 scenarios 1–8** + contract testids; **SC-001** = side-by-side with **`screen.png`**.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js **22.x** (LTS) — `package.json` / `001-project-setup`  
**Primary Dependencies**: Vue 3.5+, Vite 6+, Pinia, **Tailwind CSS 4.x** (`@tailwindcss/vite`), **vue-router** 4.x (`/`, `/game`, `/briefcase`), Vitest, Playwright, `vite-plugin-pwa`  
**Storage**: N/A server-side; optional Pinia / `ref` for Briefcase UI state  
**Testing**: Vitest; Playwright **`e2e/briefcase-view.spec.ts`** per **contracts/briefcase-view.e2e.schema.json**  
**Target Platform**: `specs/001-project-setup/research.md` browser matrix  
**Project Type**: Single-package Vue PWA (SPA)  
**Performance Goals**: Cheap CSS-only decorative motion; **60 fps** canvas when game loop ships  
**Constraints**: English UI; **≥320px**; CI **Vitest → `vite build` → `vite preview` → Playwright**; **FR-007** — no Briefcase chrome on canvas  
**Design inputs (authoritative paths)**:

- `/Users/kacperthecat/memo game/memo-game/designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/code.html`
- `/Users/kacperthecat/memo game/memo-game/designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/screen.png`
- Optional rhythm: `.../inspection_summary_history/` (non-color only)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind; **vue-router** for `/`, `/game`, `/briefcase`.
- [x] **Canvas**: Tiles on **`/game`** via **`GameCanvasShell`**; not on **home**; Briefcase = **DOM**.
- [x] **Performance**: Bounded DOM decoration; canvas budgets when loop ships.
- [x] **Responsive + PWA + state**: Client-only UI state for chrome.
- [x] **Tests**: Playwright ↔ spec scenarios; Vitest for components.
- [x] **Copy + browsers**: English; matrix in **research.md**.
- [x] **Accessibility**: Pointer-first; **`prefers-reduced-motion`** on backdrop/glass; **FR-010(a)** difficulty group requires **fieldset/legend** or **ARIA** + **keyboard** radios (spec Edge Cases).
- [x] **Repo layout**: Single `package.json`; `e2e/` at root.
- [x] **Design**: **Spec + plan** cite **`designs/`** paths (**FR-006** minimum); tokens in CSS.
- [x] **CI**: Vitest → build → preview → Playwright.
- [x] **Scope**: Recruitment/portfolio per README/spec.

### Post–Phase 1 re-check

**research.md**, **data-model.md**, **contracts/**, **quickstart.md** aligned with **`designs/`**-first **FR-002**, routes, **FR-010**, and **tile** difficulty (**Session 2026-04-07 — 3**).

## Project Structure

### Documentation (this feature)

```text
specs/002-stitch-theme-briefcase/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── briefcase-view.e2e.schema.json
├── spec.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/
├── the_briefcase_main_menu/code.html    # FR-002 + FR-010(a) layout reference
├── the_briefcase_main_menu/screen.png   # SC-001 visual reference
└── inspection_summary_history/          # optional non-color rhythm
e2e/briefcase-view.spec.ts
src/
├── style.css                            # @theme: map design export → memo-* tokens
├── constants/appCopy.ts
├── components/briefcase/BriefcaseView.vue
├── components/briefcase/BriefcaseGlassPanel.vue
├── components/ui/AppButton.vue, AppPanel.vue
├── views/BriefcaseViewPage.vue          # backdrop + layout
├── views/HomeView.vue, GameView.vue
└── router/index.ts
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Canvas not on **home** | Constitution: playable grid on **Canvas**; **home** is product shell per **FR-007** / IA | Canvas on `/` conflicts with main-entry UX |

## Design reference log (**FR-006** minimum)

*No API keys in git. **In-repo paths satisfy FR-006** for design traceability; Stitch MCP IDs are optional.*

| Reference | Source | Path / identifier | Notes |
|-----------|--------|-------------------|-------|
| **Briefcase (Main Menu)** | **Repo export** | `designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/` | **`code.html`** + **`screen.png`** — **FR-002** palette, glass (blur 24px, border, inset shadow), ambient glows, **primary** `#E4A834`, **background-dark** `#090C12`, noise layer; **FR-010(a)** **radio-card** difficulty row (`.radio-card`, **3** columns on `md+`) |
| **Inspection** (optional) | **Repo export** | `designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/inspection_summary_history/` | Non-color rhythm only; must not override Main Menu palette |
| Stitch MCP (optional) | MCP / external | _TBD_ | Supplementary traceability only; **must not** justify drift from **`designs/.../the_briefcase_main_menu/`** |

**T022** (tasks): optional row — record **Stitch MCP** project/screen IDs when available; **not** required to close **FR-006** now that **`designs/`** paths are listed above.

## Token extraction notes (from `code.html`)

Use these as the **target** for `src/style.css` **`memo-*`** (or aliased) variables until **SC-001** passes:

| Design export name | Example value | Role |
|--------------------|---------------|------|
| `primary` | `#E4A834` | CTA, focus rings, **selected** difficulty tile accent |
| `background-dark` | `#090C12` | Page / body backdrop |
| `surface` | `rgba(20, 25, 36, 0.4)` | Glass panel fill |
| `text-main` | `#F2F4F7` | Primary text |
| `muted` | `#8492A6` | Secondary labels (**Select Difficulty**, tile sublines) |
| `border-glass` | `rgba(255, 255, 255, 0.08)` | Glass borders, tile borders |
| Glass panel | `backdrop-filter: blur(24px) saturate(150%)` + inset highlight + outer shadow | **BriefcaseGlassPanel** |
| Ambient | `bg-primary/10` + `bg-purple-900/10` large blurs | **BriefcaseViewPage** backdrop layers |
| Noise | SVG `feTurbulence` data-URI ~5% opacity | Optional full-page overlay per export |
| **Difficulty tiles** | `.radio-card` + `peer` radios; `bg-white/5` tile face; grid `gap-3` | **FR-010(a)** — **no** `<select>` |

**Typography**: Export uses **Clash Display**, **Satoshi**, **Space Grotesk** (CDN in `code.html`). **Decision**: start with **system-ui** stack for bundle simplicity; add **font-face** or **@import** in a later task if **SC-001** requires closer match.

**Tile secondary lines**: Export shows mono sublines (**4x4 Grid**, **6x6 Grid**, **8x8 Grid**). Use **English** strings from **`appCopy.ts`**; they MAY match the export for **SC-001** or follow product copy if **FR-003** dictates a change.

## Follow-on implementation (`tasks.md`)

See **`tasks.md`** for executed phases. **Open alignment**: if Briefcase still uses a **`<select>`** for difficulty, replace with **three** **radio tiles** per **spec FR-010(a)** and **`code.html`**. Then reconcile **`src/style.css` + Briefcase Vue** to the token table and **`screen.png`**; optional **font parity**.

## Phase 2 (planning command scope)

Phase 0–1 artifacts: **research.md** (designs-first + difficulty tiles), **data-model.md** (export-aligned tokens + tile group), **quickstart.md**. **contracts/** updated so **`briefcase-difficulty`** documents the **radiogroup / tile container** expectation.
