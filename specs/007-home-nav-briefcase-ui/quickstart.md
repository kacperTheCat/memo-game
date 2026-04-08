# Quickstart: Home & Navigation Layout Alignment (007)

**Plan**: [`plan.md`](./plan.md) | **Date**: 2026-04-08

## Prereqs

- Node **22.x**, **`pnpm`** as in root **`package.json`**
- From repo root: **`pnpm install`**

## Implement / verify locally

1. **Dev server**: `pnpm dev` — exercise **`/`**, **`/briefcase`**, **`/game`** flows.
2. **Unit tests**: `pnpm test` — run after extracting shared components.
3. **E2E (preview)** — `pnpm test:e2e:preview` or full **`pnpm test:e2e`** per CI parity.

## Manual scenario checklist

| # | Action | Expected |
|---|--------|----------|
| 1 | Start a game on **`/game`**, open top chrome | Only **Return to Briefcase** + **Abandon Game**; no legacy heading / **nav-to-home** in that region |
| 2 | **Return to Briefcase** mid-game | **`/briefcase`**; return to **`/game`** resumes board |
| 3 | **Abandon Game** | Confirm dialog; then **`/briefcase`**; resume no longer restores prior board |
| 4 | Open **`/`** | History table (won rows); **Configure New Game** visible as **primary gold** CTA; **Return to Game** only if in progress (secondary nav + icon) |
| 5 | **`/briefcase`** | **Return to Start Screen** → **`/`**; **Return to Game** visible only when in progress |
| 6 | Win a game | Debrief layout **unchanged** (Play Again, ledger, Return to Briefcase); no **Abandon** pair on debrief |

## Design spot-check (reviewer sign-off)

1. **Grain parity (FR-009)** — In one session: complete a win to open **post-match debrief** on **`/game`**, then open **`/`** and **`/briefcase`** in other tabs. Compare **noise strength** and legibility; hub grain must read **no weaker** than debrief (same SVG noise recipe + **0.07** opacity on **`HubGrainLayer`** vs debrief **`.noise-bg`**). Note outcome: ☐ acceptable ☐ needs tweak.
2. **Nav icons (FR-004)** — On **debrief**, **active `/game`**, **`/`**, **`/briefcase`**: confirm **Material Symbols** (`material-symbols-outlined`): **`arrow_back`** (left hover), **`arrow_forward`** on **Return to Game** (right hover), **`close`** on **Abandon**; font loaded (see **`index.html`** / **plan**).
3. **Configure CTA (FR-007)** — On **`/`**, **Configure New Game** is **gold primary**; **Return to Game** (when shown) stays **muted secondary** with icon + label.
