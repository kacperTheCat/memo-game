# Quickstart: 008-game-tile-polish

## Prerequisites

- Node **22.x**, **pnpm** (see root `package.json`).
- Branch: **`008-game-tile-polish`**.

## Run the game locally

```bash
cd "/Users/kacperthecat/memo game/memo-game"
pnpm install
pnpm dev
```

Open `/game`, play a round: verify flip, **mismatch: shake then flip back to concealed**, **match collect-and-merge** (tiles shrink into strip below grid), parallax, rarity gradients, neutral backs.

## Tests

```bash
pnpm test
pnpm run lint
pnpm run test:e2e:preview   # or full test:e2e per CI
```

Add **`e2e/tile-visual-polish.spec.ts`** as specified in `spec.md` (map to stories P1–P4).

## FPS checklist (SC-007)

1. Use **Chrome DevTools → Performance**: record 5–10 s while flipping tiles, triggering a wrong pair (**shake + flip-back**), a **match (collect flight + strip)**, and moving the pointer for parallax.
2. Note **average FPS** during each effect; target **≥ 60** on baseline hardware; **120** on a high-refresh monitor if available.
3. If frames drop: simplify glass gradients / overlays first; avoid canvas blur; confirm only one rAF driver is scheduling full repaints.

## Key files (current)

- `src/components/GameCanvasShell.vue` — canvas size, paint loop, pointer, images
- `src/game/canvasTileDraw.ts` — per-tile draw
- `src/game/tileParallax.ts` — raw offset (to be smoothed)
- `src/stores/gamePlay.ts` — `tryPick`, mismatch timer
- `src/game/memoryEngine.ts` — phase transitions

## Spec links

- Feature spec: [`spec.md`](./spec.md)
- Research decisions: [`research.md`](./research.md)
- Data model notes: [`data-model.md`](./data-model.md)
