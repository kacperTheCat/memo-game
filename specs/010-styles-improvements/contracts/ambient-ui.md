# UI contract: Ambient visuals (010)

Public-facing **test hooks** and **observable behaviors** for automation. Not an HTTP API.

## `data-testid` / attributes

| Hook | Location (planned) | Purpose |
|------|--------------------|---------|
| `hub-grain-layer` | Existing `HubGrainLayer` | Grain presence; may add `data-grain-animated` when motion enabled |
| `briefcase-backdrop` | Existing `BriefcaseViewPage` | Backdrop container for ambience + spotlight |
| `ambient-spotlight` | Full-viewport layer under content on Home, Briefcase, Win debrief | Spotlight root for z-order / opacity checks |
| `data-ambient-spotlight-active` | Same root (recommended) | `"true"` when spotlight envelope is **visibly on** (moving mouse or active touch); `"false"` after **mouse idle fade** or **no touch**—supports SC-007 / SC-008 automation |
| `data-memo-spotlight-vp-x`, `data-memo-spotlight-vp-y` | Same root | Integers **0–100**: smoothed centroid **x** / **y** as % of **visual viewport** width/height (fixed layer; regression for wide-document overflow) |
| `win-debrief-root` | Existing `WinDebriefPanel` | Win screen root |
| `operation-complete-heading` | New: wrapper around “Operation Complete” | Letter stagger container |

## Z-order contract

On Home, Briefcase, and Win debrief:

1. **Backdrop** (grain, optional vignette) — lowest practical stack within page.
2. **Spotlight** + (Briefcase only) **yellow ambience** — **above** grain, **below** main content column (`z-10` or equivalent).
3. **Interactive UI** — always above layers 1–2.

## Canvas (`GameCanvasShell`)

- Expose optional `data-testid="game-canvas-shell"` if missing (verify before duplicate).
- Documented custom props for automation (if added): e.g. `data-board-pointer-x` / `data-board-pointer-y` normalized **0–1** for last pointer in board coordinates (optional; only if E2E needs it).

## Spotlight visibility (contract)

- **Mouse:** After plan-defined **idle** from last move, root opacity (or `data-ambient-spotlight-active`) MUST reflect **off** for E2E.
- **Touch:** When no active touches, same MUST reflect **off** within a **short** fade window.

## Reduced motion

When `prefers-reduced-motion: reduce`:

- Spotlight may be **static**, **heavily damped**, or **off** (must satisfy FR-009).
- Grain CSS animation **disabled**.
- Operation Complete **no stagger** or single short fade.

## Copy

- **Operation Complete** remains **English** (FR-010).
