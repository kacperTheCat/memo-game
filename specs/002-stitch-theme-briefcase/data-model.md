# Data Model: Stitch-Referenced Theme and The Briefcase View

**Feature**: 002-stitch-theme-briefcase | **Date**: 2026-04-07

This feature is **UI- and theme-centric**. There is **no server-side database**. Entities below are **conceptual** for implementation and tests.

## ThemeTokenSet

Semantic tokens **must align** with **`designs/.../the_briefcase_main_menu/code.html`** (spec **FR-002**). Map into app **`memo-*`** (or equivalent) in `src/style.css`.

| Field / concern | Design export (`code.html`) | Description |
|-----------------|----------------------------|-------------|
| `color.background` | `background-dark` `#090C12` | Page / app backdrop + noise layer as in export |
| `color.surface` | `surface` `rgba(20,25,36,0.4)` | Glass panel fill (with **backdrop-blur**) |
| `color.text.primary` | `text-main` `#F2F4F7` | Headings, primary body |
| `color.text.muted` | `muted` `#8492A6` | Secondary copy, labels |
| `color.accent` | `primary` `#E4A834` | CTAs, focus, selected difficulty accent |
| `color.border` | `border-glass` `rgba(255,255,255,0.08)` | Glass borders |
| `glass.blur` | `.glass-panel` | `blur(24px) saturate(150%)` + inset highlight + outer shadow |
| `radius.glass` | `borderRadius.glass` `24px` | Main glass card radius |
| `backdrop.glow` | ambient divs in `code.html` | **primary/10** + **purple-900/10** large blurs |
| `font.heading` / `font.body` | Clash Display / Satoshi (export CDN) | Optional: system stack first, then font parity |

**Validation**: Tokens defined once (CSS + Tailwind `@theme`); **SC-001** vs **`screen.png`**; **SC-004** cites **`designs/`** paths in **plan.md**.

## BriefcaseView (UI concept)

| Field / concern | Description |
|-----------------|-------------|
| `route` | `/briefcase` |
| `regions` | Landmark regions for tests: header, main, primary actions |
| `copy` | **`src/constants`** (English only) |
| `layout` | Responsive **≥320px**; FR-005 / SC-003 |
| `mainMenuChrome` | **FR-010**: `BriefcaseGlassPanel` + testids `briefcase-glass-panel`, `briefcase-difficulty` (**radiogroup** host: **three** **radio** **tiles** Easy/Medium/Hard per **`code.html`**), `briefcase-seed-input`, `briefcase-unlock-showcase` |
| `backdropHost` | **FR-010(e)**: `data-testid="briefcase-backdrop"`; CSS-only; `motion-reduce:` fallback partners with glass panel |

**State**: Optional Pinia for UI-only state. **Seed** / **difficulty** may live in component **ref** until the game reads them. **No** required persistence.

## GameView (UI concept)

| Field / concern | Description |
|-----------------|-------------|
| `route` | `/game` (canonical) |
| `canvas` | Mounts **`GameCanvasShell`** only here (**FR-007**) |
| `copy` | English labels for any chrome (e.g. back to home) |
| `tests` | `data-testid="game-canvas"` on canvas host per E2E contract |

## HomeView (main entry)

| Field / concern | Description |
|-----------------|-------------|
| `route` | `/` |
| `content` | **DOM** landing; **must not** render **`GameCanvasShell`** |
| `navigation` | **FR-008**: **English** control(s) to **`/briefcase`**; **FR-009**: **English** control(s) to **`/game`** |

## StitchReferenceManifest (documentation)

Traceability in **`plan.md`** — minimum **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/`** paths (**FR-006**). Optional Stitch MCP IDs. Never store API keys in tracked files.

## AppNavigation (in-app)

Conceptual **Vue/DOM** navigation (**not** Stitch-prescribed).

| Field / concern | Description |
|-----------------|-------------|
| `homeToBriefcase` | From **`/`** → **`/briefcase`**; **English**; `data-testid="nav-to-briefcase"` |
| `briefcaseToHome` | From **`/briefcase`** → **`/`**; **English**; `data-testid="nav-to-home"` |
| `homeToGame` | From **`/`** → **`/game`**; **English**; `data-testid="nav-to-game"` |
| `styling` | **ThemeTokenSet** / shared components (P2) |

**Validation**: Deep load **`/briefcase`** → **home** → **briefcase** without dead ends. **Home → game** exposes canvas host.
