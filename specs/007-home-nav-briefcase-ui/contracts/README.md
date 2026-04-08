# Contracts: Home & Navigation Layout Alignment (007)

**Plan**: [`plan.md`](./plan.md) | **Date**: 2026-04-08

This feature is **UI-only**; contracts are **behavioral + `data-testid`** expectations for E2E and component tests. Exact testids may be finalized during implementation; update this folder if IDs change.

## Navigation affordances

**Icons (007 FR-004):** Secondary nav controls SHOULD expose **Material Symbols** as `<span class="material-symbols-outlined">` with ligature text **`arrow_back`**, **`arrow_forward`**, or **`close`** as applicable (E2E may assert presence of class + glyph).

| Control | Expected `data-testid` (proposed) | Action |
|---------|-----------------------------------|--------|
| Return to Briefcase (active play) | `game-return-briefcase` | Navigate **`/briefcase`**, keep in-progress |
| Abandon Game | `game-abandon-game` (existing) | Confirm → abandon → **`/briefcase`** |
| Return to Briefcase (debrief) | `win-return-briefcase` (existing) | Unchanged |
| Return to Start Screen (briefcase hub) | `briefcase-return-home` | Navigate **`/`** (`RouterLink` / `MemoSecondaryNavButton`) |
| Return to Game (briefcase hub) | `briefcase-return-game` | Navigate **`/game`**, resume |
| Configure New Game (home) | `home-configure-game` | Navigate **`/briefcase`** |
| Return to Game (home) | `home-return-game` | Navigate **`/game`**, resume |

## Grain / hub backdrop (US4, Playwright-required)

| Element | Expected `data-testid` | Notes |
|---------|------------------------|--------|
| Shared noise/grain overlay | `hub-grain-layer` | **Required** on **`/`** and **`/briefcase`** for E2E (see `tasks.md` T024–T026) |

## History ledger

| Element | Expected `data-testid` |
|---------|-------------------------|
| Table wrapper | **`session-history-table`** (canonical shared testid for home + debrief ledger; update any lingering **`win-history-table`** expectations in E2E) |
| Empty state | `session-history-empty` |

## Routes (product-facing)

| Route | Purpose |
|-------|---------|
| **`/`** | Home hub: ledger + actions |
| **`/briefcase`** | Configure + hub nav |
| **`/game`** | Board or debrief (006); active-play chrome per **007** |
