# Contracts: Tile asset warmup and non-blocking board paint (018)

## UI / E2E hooks

| Hook | Element | Values / notes |
|------|---------|----------------|
| `game-canvas-shell` | Container | Existing; unchanged contract |
| `game-canvas` | `<canvas>` | `aria-busy` is `"true"` while deal artwork loading, `"false"` when ready |
| `game-canvas-assets-loading` | Overlay | Present while busy; English “Loading artwork…”; `pointer-events: none` |

## Path contract (warmup vs deal)

Warmup uses the same path list as the static grid builder:

- `easy` → first **8** `imagePath` values from `src/data/tile-library.json`
- `medium` → first **18**
- `hard` → first **32**

Defined by `gridDimensions` in `src/game/canvas/buildGridLayout.ts`.

## Vitest contract

`tileImagePathsForDifficulty(difficulty)` returns lengths **8 / 18 / 32** for the shipped library and matches the first *n* entries’ `imagePath` fields.

## Out of scope

- No JSON schema change for `tile-library.json`
- No new REST or IPC interfaces
