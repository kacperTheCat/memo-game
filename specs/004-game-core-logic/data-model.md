# Data model: game core logic & session persistence

**Spec**: `[spec.md](./spec.md)` | **Branch**: `004-game-core-logic`  
**Extends**: `specs/003-csgo-tile-libraries/data-model.md` (`TileEntry`, `Difficulty`, `GridCell` fill rules)

## Runtime: `TileRuntimeState` (per cell index)

Index `k` maps to `(row, col)` via existing grid dimensions (`k = row * cols + col`). Cells may be **removed** (matched); implementation MAY keep sparse map `Record<number, TileRuntimeState>` or fixed-length array.


| Field           | Type                                   | Description                                                                    |
| --------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| `identityIndex` | `number`                               | Index into the deal’s identity subset **`0..n-1`**, where **`n`** is the number of distinct items in the round (**`n = cells.length / 2`** for standard easy/medium/hard presets). Resolving a face image MUST use this same **`n`** (not a mismatched global setting) so pairs always show the correct two tiles. |
| `phase`         | `'concealed' | 'revealed' | 'matched'` | `matched` = removed from play (no hit, no draw).                               |
| `flipProgress`  | `number` (0–1, optional)               | Animation normalized time; omit if engine uses implicit RAF state.             |


**Validation:** `matched` implies no further transitions except snapshot restore.

---

## Runtime: `PairResolutionState`


| Field         | Type            | Description                                                        |
| ------------- | --------------- | ------------------------------------------------------------------ |
| `firstIndex`  | `number | null` | First selected cell index in current turn.                         |
| `secondIndex` | `number | null` | Second selected cell, if any.                                      |
| `locked`      | `boolean`       | True while waiting to resolve match/mismatch (ignore extra picks). |


**Transitions:**

- Idle → one pick: set `firstIndex`, unlock second pick.
- Two picks: `locked = true`; compare identities → match → both `matched`; mismatch → after delay both `concealed`; then clear picks, `locked = false`.

---

## Entity: `GameSession` (in-memory + snapshot)


| Field          | Type                                  | Rules                                                                                                                                                                                                       |
| -------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sessionId`    | `string`                              | Stable UUID or `crypto.randomUUID()` for this round.                                                                                                                                                        |
| `difficulty`   | `Difficulty`                          | From `GameSettings` / Briefcase at round start.                                                                                                                                                             |
| `clickCount`   | `number`                              | Non-negative; increment once per **accepted** tile selection (not while `locked` ignoring input—see spec FR-007). MUST appear on snapshots and **completed** records for **future statistics** aggregation. |
| `activePlayMs` | `number`                              | Accumulated **active** milliseconds (FR-009).                                                                                                                                                               |
| `startedAt`    | `string` (ISO)                        | Wall clock for display/analytics.                                                                                                                                                                           |
| `completedAt`  | `string | null` (ISO)                 | Set when win (or abandon if defined).                                                                                                                                                                       |
| `status`       | `'in_progress' | 'won' | 'abandoned'` | Drives persistence branch.                                                                                                                                                                                  |


---

## Snapshot: `SessionSnapshot` (persisted, in-progress)

Serializable object written to `localStorage` while `status === 'in_progress'`.


| Field           | Type                               | Description                 |
| --------------- | ---------------------------------- | --------------------------- |
| `schemaVersion` | `number`                           | e.g. `1`.                   |
| `session`       | `GameSession`                      | Subset of fields as needed. |
| `cells`         | `TileRuntimeState[]` or sparse map | Full board state.           |
| `pair`          | `PairResolutionState`              | Restore mid-turn safely.    |


**Validation:** On load, if `schemaVersion` mismatch, discard or migrate (plan: discard with toast).

**Restore rule:** After a successful load, **`session.difficulty`** MUST be applied to **`useGameSettingsStore.difficulty`** (or paint/hit-test must otherwise use a single consistent source tied to `session` + `cells`) so grid dimensions, identity **`n`**, and tile artwork stay aligned. Avoid running a “difficulty changed” workflow that starts a **new** round on top of restored cells.

---

## Entity: `CompletedSessionRecord` (persisted, history)

Appended when the round ends with `**won`** (all pairs cleared) or the player **abandons** via the **Abandon game** control (outcome `abandoned`).


| Field          | Type                  | Rules                  |
| -------------- | --------------------- | ---------------------- |
| `sessionId`    | `string`              | Same as in-progress.   |
| `difficulty`   | `Difficulty`          | Required.              |
| `clickCount`   | `number`              | Required.              |
| `activePlayMs` | `number`              | Required.              |
| `completedAt`  | `string` (ISO)        | Required for ordering. |
| `outcome`      | `'won' | 'abandoned'` | Required.              |


**Storage:** JSON array in `localStorage`, max length cap (e.g. 200) with drop-oldest to avoid quota issues—document in implementation.

---

## Pinia: suggested modules


| Store                             | Responsibility                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| `useGameSettingsStore` (existing) | `difficulty` for **new** rounds and Briefcase UI; MUST match `GameSession.difficulty` after snapshot restore and when starting rounds from settings. |
| `useGameSessionStore` (new)       | `GameSession`, `SessionSnapshot` hydrate/dehydrate, tick active time, append history. |
| Briefcase UI                      | Difficulty radios are **next-start** only (no prompt on change). Navigating from Briefcase to `/game` (Unlock or Play) with `in_progress` and selected difficulty ≠ `GameSession.difficulty` MUST confirm abandon (FR-014). |


---

## Relationships

- `Difficulty` + `TileLibrary` → grid dimensions and identity assignment (unchanged from 003). Runtime **face** lookup MUST use the deal’s **`n`** (see `TileRuntimeState.identityIndex` and spec **FR-013**).
- `GameSession` references one board (`cells`) until terminal state.
- `CompletedSessionRecord` is **append-only** for future statistics feature (spec out of scope).

