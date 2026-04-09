# Quickstart: verify 016 wrong-pair tile input

## Prerequisites

- Node **22.x**, **pnpm** (root `package.json`).
- Repo root: `/Users/kacperthecat/memo game/memo-game` (or your clone).

## Manual check

1. `pnpm dev`, open **`/game`** (or flow from home/briefcase).
2. Reveal tile A, then reveal non-matching tile B.
3. **While** the wrong-pair shake / flip-back is still running, tap a **third** concealed tile C (not A or B).
4. **Expect:** C reveals (or begins reveal) **without** waiting for the mismatch animation to finish; game remains consistent (no stuck cards, win still achievable).
5. Repeat a wrong pair and **wait** without tapping: **expect** full mismatch behavior and **`fail`** sound as today.

## Automated checks

```bash
pnpm test
pnpm run test:e2e:preview
```

Ensure **`e2e/game-wrong-pair-input-during-animation.spec.ts`** is green once implemented.

## Files to touch (planning reference)

- `src/game/memory/memoryEngine.ts` — interrupt path + **`isWrongPairPending`** (or equivalent).
- `src/stores/game/gamePlay.ts` — timer arms on wrong pair without relying on **`locked`**; cancel / no-op rules.
- `src/components/game/GameCanvasShell.vue` — mismatch visuals use wrong-pair predicate, not **`locked`** alone.
- `src/game/memory/memoryEngine.spec.ts`, `src/stores/game/gamePlay.spec.ts`, new **`e2e/...spec.ts`**.
