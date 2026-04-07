# Research: Stitch-Referenced Theme and The Briefcase View

**Feature**: 002-stitch-theme-briefcase | **Date**: 2026-04-07 (updated: **designs/**-first **FR-002**)

## Client routing (home, game, briefcase)

- **Decision**: **`vue-router` 4** with **`/`** → **HomeView** (main entry, **DOM** only, **no** `GameCanvasShell`), **`/game`** → **GameView** (mounts **`GameCanvasShell`** / canvas tiles), **`/briefcase`** → **BriefcaseViewPage**.
- **Rationale**: Matches **FR-007**/**FR-009** and architecture clarification: users **run the game** from **home** into **`/game`**; **Briefcase** stays a separate themed DOM screen; stable URLs for Playwright (`/`, `/game`, `/briefcase`).
- **Alternatives considered**: Canvas on **home**—rejected per updated IA; single view toggles—rejected (weaker deep-linking and E2E clarity).

## Theme tokens and Tailwind v4

- **Decision**: Encode **semantic** tokens as **CSS custom properties** in `src/style.css` (or `src/theme/tokens.css`), mapped through Tailwind v4 **`@theme`**. **Numeric values** MUST be **lifted from** **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/code.html`** (Tailwind config block + `.glass-panel` / body styles)—see **`plan.md` → Token extraction notes**.
- **Rationale**: **FR-002**; single system for **home**, **game** chrome, **Briefcase**, and **nav**; **SC-004** maps changes to theme rules + cited **`designs/`** paths.
- **Alternatives considered**: Legacy **`memo-*`** approximations without re-reading **`code.html`**—rejected when they drift from export.

## In-repo design exports (mandatory, FR-002 / FR-006)

- **Decision**: Treat **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/`** as the **authoritative** implementation reference; **`inspection_summary_history/`** optional for **non-color** rhythm only.
- **Rationale**: Spec **Session 2026-04-07 — 2**; stable, diffable, offline.
- **Alternatives considered**: Stitch MCP as **sole** source—rejected (drift risk vs shipped export).

## Stitch MCP workflow (optional traceability)

- **Decision**: If used, record MCP project/screen IDs in **`plan.md`**; **never** override **`designs/.../the_briefcase_main_menu/`** token choices without **SC-001** + plan note.
- **Rationale**: **FR-006** optional supplement.
- **Alternatives considered**: MCP-only—rejected by spec.

## Difficulty UI (FR-010(a), spec Session 2026-04-07 — 3)

- **Decision**: **Three** **tile**-style **radio** options (**Easy**, **Medium**, **Hard**) in **`BriefcaseView.vue`**, mirroring **`the_briefcase_main_menu/code.html`** (`.radio-card` pattern: **label** wraps **sr-only** `input type="radio"`, visible card face, **grid** `grid-cols-1 md:grid-cols-3 gap-3`). **`<select>`** MUST **not** be primary. **fieldset** + **legend** (or **role="radiogroup"** + **aria-labelledby**) for accessible name; native **radio** keyboard behavior.
- **Rationale**: Spec **FR-010(a)**; **SC-001** parity with export; Edge Case on **keyboard** / **screen reader** for the group.
- **Alternatives considered**: **`<select>`** only—rejected by clarification.

## Playwright coverage shape

- **Decision**: **`e2e/briefcase-view.spec.ts`** for **P1 scenarios 1–8**: **home** (no `game-canvas` in DOM), **nav** to **`/briefcase`** and back; **deep link** `/briefcase` then **home** and back; **home → `/game`** then assert **`data-testid="game-canvas"`**; **Briefcase** **`briefcase-seed-input`**, **`briefcase-difficulty`** (container for **three** **radio** **tiles**), **`briefcase-glass-panel`**, **`briefcase-unlock-showcase`**; **backdrop** **`briefcase-backdrop`**; **`prefers-reduced-motion`** smoke; **English** on **nav**; phone + desktop widths.
- **Rationale**: **FR-008**, **FR-009**, **FR-010**/**FR-010(e)**; see `contracts/briefcase-view.e2e.schema.json`. Subjective “match Stitch” remains **SC-001** human review.
- **Alternatives considered**: Asserting canvas on **home**—obsolete.

## Briefcase page backdrop (FR-010(e))

- **Decision**: Match **`code.html`**: **base** `#090C12`, **noise** overlay (SVG turbulence ~5% opacity), **ambient** soft blurs (**primary/10**, **purple-900/10**). Implement as **DOM/CSS** on **`BriefcaseViewPage`**. Use **`prefers-reduced-motion: reduce`** to drop or simplify **motion** (keep **contrast** / **FR-005**).
- **Rationale**: **FR-007**; **FR-002** alignment with export.
- **Alternatives considered**: **Canvas** backdrop—rejected (**FR-007**).

## Browser matrix

- **Decision**: Inherit **`001-project-setup/research.md`**.
- **Rationale**: Unchanged.
- **Alternatives considered**: None.
