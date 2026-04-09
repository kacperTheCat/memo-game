# Data model: 008-game-tile-polish

## Persistent / snapshot domain (unchanged schema version)

Aligned with `SessionSnapshot` / `TileRuntimeState` in `src/game/memoryTypes.ts`:

| Field | Type | Notes |
|-------|------|-------|
| `cells[].identityIndex` | number | Index into active tile subset / library |
| `cells[].phase` | `'concealed' \| 'revealed' \| 'matched'` | Source of truth for gameplay |
| `cells[].flipProgress` | optional number | **Do not persist.** Either remove from persisted shape or strip in `buildSnapshot` so `localStorage` never stores animation frames. |
| `pair` | `PairResolutionState` | First/second index, `locked` for mismatch resolution |

**Validation:** Existing `schemaVersion === 1` rules in `gameSession` stay valid; no new required fields for v1.

**Collection strip:** **Not** stored in `SessionSnapshot` for v1. After reload, strip UI may be empty until new matches (or future schema adds `collectedIdentityOrder: number[]`).

## Catalog entity (existing)

`TileEntry` (`src/game/tileLibraryTypes.ts`):

| Field | Use in this feature |
|-------|---------------------|
| `rarity` | Tier ladder → top tier → gold background (**FR-003**, **FR-004**) |
| `color` | Accent for non-top-tier face gradients (**FR-003**) |
| `imagePath` | Decoded image for face art |

## Ephemeral visual model (canvas runtime only)

Lives only in the canvas runtime (not Pinia snapshot):

### Per cell index (0 … N-1)

| Concept | Type | Purpose |
|---------|------|---------|
| `revealFlipT` | 0…1 | Interpolate concealed → revealed art (**FR-008**) |
| `mismatchPhase` | `'idle' \| 'shake' \| 'flip_back'` | **FR-010**: wrong-pair visuals run **shake first**, then **flip_back** |
| `mismatchShakeT` | 0…1 | Wobble while `mismatchPhase === 'shake'` (faces stay up) |
| `concealFlipT` | 0…1 | During `flip_back`, 0…1 drives face→back (inverse of reveal) |
| `parallaxDisplay` | `{ ox, oy }` | Smoothed offset vs raw pointer target (**FR-007**) |

### Collect flight (active match resolution, **FR-009**)

While a pair is animating to the strip:

| Concept | Type | Purpose |
|---------|------|---------|
| `collectIndices` | `[i, j]` \| `null` | The two board cells in flight (if engine already `matched`, they are not hit-tested) |
| `collectT` | 0…1 | Normalized time; drives position lerp and **monotonic scale down** |
| `collectStartRects` | two rects | Board-space CSS px at match start |
| `collectTarget` | `{ x, y, w, h }` | Strip slot for merged chip |

**Lifecycle:**

- On `phase` transition to `revealed` for index `i`, start or reset `revealFlipT` animation.
- On **match**: start `collectFlight` for the two indices; advance `collectT` each frame until 1; then push **`StripChip`** (below), clear flight, ensure cells draw as **matched** / empty board cells.
- On mismatch while `pair.locked`: set `mismatchPhase = 'shake'` and advance `mismatchShakeT`; when shake completes, set **`flip_back`** and run `concealFlipT` 0→1 on both indices; then align with engine transition to `concealed`. **Do not** skip straight to concealed with no flip-back segment (**FR-010**). Align total wall-clock with **SC-004** / **FR-011**.

### Collection strip (runtime list)

| Concept | Type | Purpose |
|---------|------|---------|
| `stripChips` | ordered array | One entry per **completed** collect, **match order** (left-to-right). Each entry: `identityIndex` (or equivalent to resolve `TileEntry`), optional precomputed slot rect. |

## Derived presentation rules

- **Concealed draw:** Must not consult `entry.color` or rarity (**FR-001**). Uniform back.
- **Revealed draw:** Gradient from `color` or gold preset; glass overlay; **unified** inner rectangle for art (**FR-002–FR-006**).
- **Matched (board):** After collect completes, cells are empty matched slots (no pick); during collect, **FR-009a** — no further picks on flight indices.
- **Strip draw:** Smaller face treatment per `stripChips[]` inside strip band; **one chip per pair**.

## State transitions (game truth)

Unchanged from `memoryEngine.ts`:

```
concealed --pick--> revealed --second pick match--> matched
revealed --second pick mismatch--> pair locked --timeout--> concealed (both)
```

Visual layer follows these transitions; it must not contradict final `phase`. Match may transition engine to `matched` immediately while shell finishes collect, provided input and hit-test rules remain consistent (**FR-009a**).
