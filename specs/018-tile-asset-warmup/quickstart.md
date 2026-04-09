# Quickstart: Tile asset warmup and non-blocking board paint (018)

## Prerequisites

- Node 22.x, `pnpm install` at repo root
- Optional: Chrome DevTools → Network throttling to observe loading overlay

## Automated checks

```bash
pnpm test
pnpm lint
pnpm exec playwright test e2e/tile-asset-warmup.spec.ts
pnpm exec playwright test e2e/screens-visual.spec.ts
```

Full suite: `pnpm run test:e2e:preview` (or project default).

## Manual smoke

1. **Direct cold game**: Open `/game?difficulty=medium&seed=111222333` with throttling. Expect grid (backs) quickly; “Loading artwork…” may flash; faces fill in without reload.
2. **Hub then game**: Open `/`, then `/briefcase`, set difficulty to **Hard**, navigate to game. Expect same settled behavior; no stuck overlay past ~10s on healthy network.
3. **Regression**: Flip tiles, complete a pair, confirm strip and animations unchanged.

## Files to skim

- `src/components/game/GameCanvasShell.vue` — paint / busy / overlay
- `src/game/tiles/tileImagePreload.ts` — hub warmup
- `src/views/home/HomeView.vue` / `src/components/briefcase/BriefcaseView.vue` — call sites
