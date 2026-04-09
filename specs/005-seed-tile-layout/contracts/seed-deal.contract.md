# Contract: seeded deal derivation

**Consumers**: `src/game/seed/seedDeal.ts` (implementation), `src/stores/game/gamePlay.ts` (caller supplies `rng`), Vitest **`seedDeal.spec.ts`**.

## `hashSeedKey(key: string): number`

- **Input**: UTF-16 string (typical ASCII: `"000000000:easy"`).
- **Output**: Unsigned 32-bit integer in JS safe integer range (`0 … 2³²-1`).
- **Determinism**: Same `key` ⇒ same output on any ES2020+ engine.

## `mulberry32(state: number): () => number`

- **Input**: `state` = result of `hashSeedKey` (or any 32-bit seed).
- **Output**: Function returning pseudo-random **`number`** in **`[0, 1)`**, suitable for `Math.floor(rng() * (i + 1))` in Fisher–Yates.
- **Determinism**: Same `state` ⇒ same sequence of values.

## `dealKey(nineDigits: string, difficulty: Difficulty): string`

- **Precondition**: `nineDigits` matches `/^\d{9}$/`.
- **Output**: Stable string, e.g. `` `${nineDigits}:${difficulty}` `` (exact format **frozen** once golden tests are recorded).

## `createSeededRngForDeal(nineDigits: string, difficulty: Difficulty): () => number`

- **Equivalent to**: `mulberry32(hashSeedKey(dealKey(nineDigits, difficulty)))`.
- **Postcondition**: Returned `rng` is independent of global `Math.random`.

## `parseNineDigitSeedOrNull(raw: string): string | null`

- **Input**: Arbitrary user string (may include hyphens from **`xxx-xxx-xxx`** UI).
- **Behavior**: Remove all non-digits; if exactly **9** characters remain and each is **`0`–`9`**, return that string; else return **`null`**.

## `rngForDealInit(difficulty: Difficulty, seedNine: string | null): () => number`

- **If** `seedNine !== null` **and** matches `/^\d{9}$/`: return **`createSeededRngForDeal(seedNine, difficulty)`**.
- **Else**: return **`Math.random`** (non-seeded path).

## Navigation payload (Briefcase → `/game`)

- **`history.state.memoDealInit`**: `{ seedNine: string | null }` where **`seedNine`** = **`parseNineDigitSeedOrNull(briefcaseSeedRaw)`** at navigation time.
- **Consumer**: **`GameCanvasShell`** reads **once** for a **new** deal, then clears state (e.g. **`router.replace`**) per [`data-model.md`](../data-model.md).

## `shuffleIdentitiesWithRng<T>(items: T[], rng: () => number): T[]`

- **Behavior**: Same as `memoryEngine.shuffleIdentities(items, rng)` — Fisher–Yates using `rng`.

## Golden vectors (implementation MUST match)

Recorded in Vitest (examples—**replace with actual values** after first failing test captures them):

| `nineDigits` | `difficulty` | `n` (pairs) | Full `identityIndex[]` after shuffle (row-major) — locked by `src/game/seed/seedDeal.spec.ts` |
|--------------|--------------|-------------|----------------------------------------------------------------------------------------|
| `000000000` | `easy` | 8 | `[6,3,4,3,7,7,5,6,0,1,0,5,1,2,2,4]` |
| `123456789` | `medium` | 18 | `[10,12,11,16,7,9,4,17,1,13,12,14,14,16,8,0,15,3,11,2,15,13,5,17,9,8,2,7,6,3,4,0,10,6,1,5]` |
| `001002003` | `hard` | 32 | `[4,22,7,26,8,30,11,22,23,8,27,1,2,10,6,19,10,16,1,6,11,3,28,0,29,0,14,25,12,4,25,31,23,30,13,14,20,9,29,9,18,15,17,24,15,21,2,16,31,17,20,21,26,5,13,18,19,3,12,28,24,5,27,7]` |

**Invariant**: For fixed **`nineDigits`**, **`difficulty`**, and **`buildGridCells`** source order, the shuffled **`identityIndex[]`** is **byte-identical** across machines.

## UI contract (Briefcase)

- **`data-testid="briefcase-seed-input"`** remains the primary selector.
- Visible value uses mask **xxx-xxx-xxx**; **paste** of `123456789` normalizes to masked form; **paste** of **more than nine** digits uses **only the first nine** decimal digits after stripping non-digits.
- Non-digits do not increase the nine-digit buffer.
- **FR-005a**: After **nine** digits are present, **typing** another digit **MUST NOT** lengthen the digit run (controlled value unchanged for that keystroke).

- **FR-005b**: **Incomplete-seed** messaging and error chrome (**`aria-invalid`**, disabled **Unlock** / header **Play**) **MUST** appear **only after** the control **`blur`**s with **1–8** digits; **navigation** **MUST** still be **blocked** for **1–8** digits even before blur (see [`spec.md`](../spec.md)).

## Briefcase navigation vs in-progress session (**FR-014** + **FR-006a**)

- When **`GameSession.status === 'in_progress'`**, **Unlock** and header **Play** **MUST** run the abandon **confirm** flow if **`GameSettings.difficulty !== gameSession.difficulty`** **or** **`GameSettings.briefcaseSeedRaw !== gameSession.dealBriefcaseSeedRaw`** (see [`data-model.md`](../data-model.md)).
- On confirm: same side effects as **FR-014** (completed row **`abandoned`**, clear in-progress storage, reset play, then push **`/game`** with **`memoDealInit`**).
