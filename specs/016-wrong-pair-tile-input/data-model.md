# Data model: Wrong-pair tile input (016)

## Overview

Game rules and persistence stay aligned with **`MemoryState`** (`src/game/memory/memoryEngine.ts`, `src/game/memory/memoryTypes.ts`). This feature adjusts **when picks are accepted** and **how mismatch completion is detected**; it does **not** add entities or storage keys.

## Core state (existing)

### `TileRuntimeState`

- **`identityIndex`**: catalog index for the face.
- **`phase`**: **`concealed` | `revealed` | `matched`** (snapshot strips ephemeral animation fields).

### `PairResolutionState`

- **`firstIndex` / `secondIndex`**: selection indices for the current turn fragment.
- **`locked`**: historically **`true`** only for a **wrong** second tile; **016** moves to **`locked: false`** during mismatch pending so input is not blocked by this flag (see **`research.md` §3**).

## Derived concept: wrong-pair pending

**Wrong-pair pending** (implementation helper, not necessarily a stored enum):

- **`firstIndex`** and **`secondIndex`** are non-null.
- Cells at those indices exist, **`phase === 'revealed'`**, and **`identityIndex`** differ (non-match).
- Not applicable once both are **`concealed`** or the pair is cleared.

All transitions into/out of this mode remain driven by **`pickCell`**, **`clearMismatch`**, and match resolution.

## Transitions (016)

1. **Wrong second tile revealed** (today + 016): cells stay **`revealed`**; **`pair`** retains both indices; **`locked`** is **`false`**; store starts **`mismatchTimer`** for **`MISMATCH_RESOLVE_MS`**.
2. **Timer fires**: if still wrong-pair pending, **`clearMismatch`**, **`playSfx('fail')`**; **`pair`** cleared.
3. **Interrupt pick** (new): player selects a **concealed** tile not in **`{firstIndex, secondIndex}`** → **`clearMismatch`** (conceal the two wrong tiles) + treat index as **first** pick of next turn (reveal it); **`mismatchTimer`** cleared on accepted pick; **`fail`** SFX policy per **`research.md` §5**.
4. **Invalid picks during pending**: matched tiles, the two revealed wrong tiles, already revealed cells, out-of-range—**rejected** as today (spec **FR-003**).

## Snapshot / hydration

- **`SessionSnapshot`** continues to store **`cells`** + **`pair`** (existing keys **`memo-game.v1.inProgress`** / **`memo-game.v1.completedSessions`** unchanged).
- **Hydration** after reload: if snapshot encodes wrong-pair pending with **`locked: false`**, **`gamePlay`** MUST still arm **`mismatchTimer`** when rehydrating so the wait path completes—implementation task in **`tasks.md`**, not a schema change.

## Validation rules

- At most **two** **`revealed`** non-**matched** tiles except during transient frame updates (interrupt path applies atomically).
- **`isWin`** unchanged: all cells **`matched`**.
