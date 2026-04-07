# Quickstart: Stitch Theme + The Briefcase View

**Feature**: 002-stitch-theme-briefcase | **Date**: 2026-04-07

## Prerequisites

- Node **22.x**, **pnpm** (see repo root `package.json`).
- **Design exports** (authoritative for **FR-002**):  
  `designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/code.html` and `screen.png`.
- **Stitch MCP** (optional): **`.cursor/mcp.json`**, **`STITCH_GOOGLE_API_KEY`** — for extra traceability only.

## Align theme to exports

1. Open **`the_briefcase_main_menu/code.html`** — copy **color** values and **glass-panel** CSS into **`src/style.css`** **`@theme` / `:root`** (see **`plan.md` → Token extraction notes**).
2. Compare running **`/briefcase`** to **`screen.png`** (**SC-001**).
3. Optional: record Stitch MCP IDs in **`plan.md`** if you use MCP.

## Run the app

```bash
pnpm install
pnpm dev
```

- **Home (main entry, DOM only)**: `/`
- **Game (canvas / tiles)**: `/game`
- **Briefcase**: `/briefcase`

## Tests

```bash
pnpm test
pnpm test:e2e
```

**`e2e/briefcase-view.spec.ts`** covers **P1 scenarios 1–8**, contract testids (including **Main Menu** chrome + reduced-motion smoke)—see **`contracts/briefcase-view.e2e.schema.json`**.

## Verify checklist (manual)

- [ ] **Difficulty**: **three** **radio** **tiles** (**Easy** / **Medium** / **Hard**), not a **`<select>`**, styled like **`code.html`** (**FR-010(a)**).
- [ ] Briefcase matches **`the_briefcase_main_menu/screen.png`** for palette, glass, backdrop, CTA (**SC-001**).
- [ ] **English** on Briefcase + all **nav** controls.
- [ ] **Home** does not show the tile **canvas**; **game** does.
- [ ] **Home → game → home** and **home ↔ briefcase** work without typing URLs; deep **`/briefcase`** still recovers.
- [ ] Narrow + wide viewports: primary actions and **nav** remain usable.
