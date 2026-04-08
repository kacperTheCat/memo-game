# Quickstart: Game Core Logic (004)

**Plan**: [`plan.md`](./plan.md)

## Prerequisites

- Node **22.x**, **pnpm** (see root `package.json`).

## Commands

```bash
cd "/Users/kacperthecat/memo game/memo-game"
pnpm install
pnpm test
pnpm run lint
pnpm run build
pnpm run preview   # http://127.0.0.1:4173 — use for manual + Playwright against built app
pnpm test:e2e:preview
```

## Manual smoke (game)

1. Open `/briefcase`, pick a difficulty, unlock/navigate to `/game`.
2. Confirm board width feels **~1200px max** on desktop (no tiny `max-w-md` regression after change).
3. **Tap/click** one tile: concealed → revealed; second tile: match removes both / mismatch flips back.
4. Background the tab 30s: **active time** should barely move (devtools Application → Local Storage optional).
5. Reload mid-game: **session restores** (or clear storage to test cold start); after reload on **easy** or **hard**, `data-rows` / `data-cols` on `[data-testid="game-grid-meta"]` MUST still match that difficulty (not silently reverting to another preset).
6. After several tile picks, inspect `localStorage` key `memo-game.v1.inProgress`: JSON SHOULD include session **`clickCount`** aligned with accepted picks (for future statistics).
7. Start a round on `/game`, navigate to **The Briefcase**, select a **different** difficulty: changing radios SHOULD **not** prompt. Click **Unlock showcase** or **Play**: you SHOULD then see an **English** confirm about abandoning the in-progress game at a different difficulty; **Cancel** stays on Briefcase; **OK** saves **`abandoned`** and opens **`/game`** with the newly selected preset.

## Test hooks for Playwright

- Canvas: `[data-testid="game-canvas"]`.
- Grid meta: `[data-testid="game-grid-meta"]` exposes `data-rows`, `data-cols`, `data-cells` for computing a **single test cell** hit point.

## Where to implement

- Canvas + input: `src/components/GameCanvasShell.vue` and new `src/game/*` modules.
- Session: new Pinia store + `localStorage` keys documented in [`contracts/README.md`](./contracts/README.md).
