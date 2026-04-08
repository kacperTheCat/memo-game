# Implementation Plan: Home & Navigation Layout Alignment (007)

**Branch**: `007-home-nav-briefcase-ui` | **Date**: 2026-04-08 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/007-home-nav-briefcase-ui/spec.md`

## Summary

Align **home** (`/`), **briefcase** (`/briefcase`), and **in-progress** **`/game`** chrome with the post-match debrief vocabulary: **Google Material Symbols Outlined** for secondary nav glyphs (**`arrow_back`** + **`group-hover:-translate-x-1`** for back; **`arrow_forward`** + **`group-hover:translate-x-1`** for **Return to Game**; **`close`** for **Abandon**); **Configure New Game** on home as **primary gold CTA**; shared **history ledger**; **HubGrainLayer** grain verified against **debrief** on `/game`. No new persistence; reuses **004** / **006** stores and routes.

## Technical Context

**Language/Version**: TypeScript **5.7**, Node **22.x** (see root `package.json`)  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), `vite-plugin-pwa`  
**External UI font**: **Material Symbols Outlined** via **Google Fonts** `<link>` in **`index.html`** (document terms in [`research.md`](./research.md) §5); for **offline-first** polish, consider self-hosted subset or ensure SW precaches font CSS + files  
**Storage**: **N/A** new keys — existing **`localStorage`** (`memo-game.v1.inProgress`, `memo-game.v1.completedSessions`) per **004** / **006**  
**Testing**: **Vitest** (`src/**/*.spec.ts`), **Playwright** (`e2e/`)  
**Target Platform**: Responsive **PWA** — **Chromium** (CI), **Firefox** + **Safari** manual  
**Project Type**: Single-package **Vue SPA** (recruitment / portfolio)  
**Performance Goals**: Nav interactions under **100 ms** perceived; font load non-blocking (`display=swap` or equivalent on Google Fonts URL)  
**Constraints**: English copy; pointer-first a11y; **decorative** icon spans **`aria-hidden="true"`**; **visible labels** remain primary for meaning  
**Scale/Scope**: **`MemoSecondaryNavButton`** supports **`variant`**: **`back` | `forward` | `dismiss`**; root control has Tailwind **`group`** for hover transforms

## Constitution Check

*GATE: Passed.*

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind.
- [x] **Canvas**: Gameplay unchanged on **`GameCanvasShell`**.
- [x] **Performance**: Font loading strategy noted above.
- [x] **Responsive + PWA + state**: Client-only persistence.
- [x] **Tests**: Playwright per story; Vitest for nav component.
- [x] **Assets**: Material Symbols per **Google Fonts** license; CSGO tiles unchanged.
- [x] **Copy + browsers**: English; matrix in **`research.md`** §8.
- [x] **Accessibility**: Labels + `aria-hidden` on icon glyphs.
- [x] **Repo layout**: Single **`package.json`**, **`e2e/`** colocated.
- [x] **Design**: Stitch refs in spec; **FR-004** Material glyph rules.
- [x] **CI**: Vitest → build → preview → Playwright.
- [x] **Scope**: Recruitment context.

## Project Structure

### Documentation (this feature)

```text
specs/007-home-nav-briefcase-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
index.html                          # Material Symbols stylesheet link
src/
├── components/
│   ├── layout/HubGrainLayer.vue
│   ├── ui/MemoSecondaryNavButton.vue   # back | forward | dismiss + group
│   ├── briefcase/BriefcaseView.vue
│   └── WinDebriefPanel.vue
├── views/HomeView.vue, GameView.vue, BriefcaseViewPage.vue
├── assets/icons/                   # optional: README only if SVG fallback retained
e2e/*.spec.ts
```

**Structure Decision**: Single Vue app under **`src/`**; **007** touches shell components, **`index.html`**, and E2E.

## Phase 0 — Research

**Output**: [`research.md`](./research.md) — includes **§5 Material Symbols** (glyphs, `group` motion, font URL, offline note).

## Phase 1 — Design artifacts

| Artifact | Path |
|----------|------|
| Data model | [`data-model.md`](./data-model.md) |
| UI contracts | [`contracts/README.md`](./contracts/README.md) |
| Manual QA | [`quickstart.md`](./quickstart.md) |

**Agent context**: `.specify/scripts/bash/update-agent-context.sh cursor-agent`

## Phase 2 — Implementation (maintenance)

Incremental work when spec changes: extend **`MemoSecondaryNavButton`** with **`forward`** variant; add font link; update Vitest to assert **`.material-symbols-outlined`** + glyph text (`arrow_back`, `arrow_forward`, `close`); keep **Return to Game** on home/briefcase on **`forward`**.

## Complexity Tracking

No constitution violations requiring justification.
