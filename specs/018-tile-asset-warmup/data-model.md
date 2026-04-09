# Data model: Tile asset warmup and non-blocking board paint (018)

## Persistence

**None.** This feature does not add or change `localStorage`, `sessionStorage`, or IndexedDB keys.

## Runtime concepts

| Concept | Description | Lifecycle |
|--------|-------------|-----------|
| Deal skin paths | Unique `imagePath` values for identities in the current `play.memory` deal | Changes when deal / session changes |
| Shell image cache | `Map<string, HTMLImageElement>` inside `GameCanvasShell` (`createCanvasShellImageCache`) | Lives with component instance |
| Warmup generation | Counter incremented when deal identity signature changes (canvas) or when scheduling hub warmup (preload module) | Prevents stale async completions from driving UI |
| `shellAssetsPending` | Vue ref: overlay visible + `aria-busy=true` while not all deal images cached in shell | Toggled during `paint()` |
| `tileImagesLoadFailed` | Vue ref: fatal load path for current deal | Cleared on new deal signature |

## Validation rules

- Warmup path list MUST match [`buildGridLayout`](../../src/game/canvas/buildGridLayout.ts): first `n` entries of `tile-library.json` for the chosen `Difficulty`.
- Image URLs MUST match Vite base URL resolution used in [`canvasShellAssets.ts`](../../src/game/canvas/canvasShellAssets.ts).

## State transitions (informal)

1. **Deal starts** → generation bumps, failure flag cleared, paint draws with placeholders / backs; async load kicks once per generation.
2. **All images ready** → `shellAssetsPending` false, full faces where applicable.
3. **Load error** → fallback fill, early return from paint for that error state until new deal.
