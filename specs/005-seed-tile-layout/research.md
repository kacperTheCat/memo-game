# Research: deterministic Briefcase seed

**Spec**: [`spec.md`](./spec.md) | **Plan**: [`plan.md`](./plan.md) | **Branch**: `005-seed-tile-layout`

## 1. Deriving a fixed PRNG seed from nine digits + difficulty

**Decision**: Concatenate canonical **nine-digit string** (no hyphens) and **`Difficulty`** with a stable separator (e.g. `"123456789:medium"`), run **FNV-1a 32-bit** over UTF-8 code units, produce **unsigned 32-bit** integer `h`, then use **`mulberry32(h)`** as the uniform `(0,1)` generator for Fisher–Yates.

**Rationale**:

- **Leading zeros**: Hashing the **string** `"000000001"` differs from `"000000000"`; numeric `parseInt` alone would collapse leading zeros.
- **Difficulty independence**: Spec requires deals for the **same** digits on **easy** vs **hard** to differ. Feeding **`difficulty`** into the hash guarantees different PRNG states even if the first `k` shuffle steps used overlapping random draws for different `n`.
- **Cross-engine stability**: FNV-1a and mulberry32 use **32-bit integer ops** and **`Math.imul`**; behavior is identical in **V8**, **SpiderMonkey**, and **JavaScriptCore** for the same inputs (no `Number` endianness issues for this use).

**Alternatives considered**:

- **`Math.random` seeding**: Not standard; rejected.
- **Single hash of digits only**: Rejected—correlated deals across difficulties for small `n` vs large `n` streams.
- **SHA-256 / crypto.subtle**: Deterministic but heavier and async; rejected for a client-only game shuffle.
- **xoroshiro / PCG**: Slightly better stats; rejected—mulberry32 is sufficient for permutations and smaller code.

## 2. Shuffle algorithm and integration point

**Decision**: Keep existing **`shuffleIdentities`** (in-place Fisher–Yates over a copy of the `identityIndex` array from **`buildGridCells`**).

**Rationale**: Already tested and used by **`gamePlay.startNewRound`**; only the **`rng`** source changes.

**Alternatives considered**:

- **Pre-seeded permutation index table**: Rejected—unnecessary storage; shuffle is cheap at `n ≤ 32`.

## 3. When to apply seeded vs random deals

**Decision**:

| Trigger | Args → RNG |
|---------|------------|
| **Briefcase → `/game`**, new deal (no snapshot) | Read **`history.state.memoDealInit.seedNine`** once; **`rngForDealInit(difficulty, seedNine)`**; then **clear** navigation state |
| **Direct `/game`** (no `memoDealInit`) | **`seedNine = null`** → **`Math.random`** |
| Restore from **`localStorage`** snapshot | **No** shuffle; hydrate cells; **ignore** `memoDealInit` |
| **`GameView` abandon** → new session + round | **`Math.random`** only |
| **Win** → `startNewRound` in shell | **`Math.random`** only (continuous play on `/game` without Briefcase) |

**Rationale**: **Stateless** deal rule — layout is a **function of** **`(difficulty, seedNine)`**; navigation supplies **`seedNine`** for one entry, not a Pinia “pending consume” lifecycle. Matches spec **optional** seed and avoids re-seeding restored boards.

**Alternatives considered**:

- **Re-seed every new round until Briefcase changes**: Rejected—spec ties seed to Briefcase entry for the **next** start; win loop is out of scope for shareable seeds.

## 4. Masked input (xxx-xxx-xxx)

**Decision**: Implement as a **controlled** text field: strip non-digits, cap **9** digits, insert hyphens at positions 3 and 6 for **display**; mirror the live value to **`gameSettings.briefcaseSeedRaw`** so **Unlock** and header **Play** share one source; **`parseNineDigitSeedOrNull`** at navigate time produces **`memoDealInit.seedNine`**.

**Rationale**: Native `<input type="number">` is poor for leading zeros and grouping; `type="text"` + `inputmode="numeric"` + filter matches product and **000-000-000** edge case.

**Alternatives considered**:

- **Third-party mask library**: Rejected unless complexity explodes—keep dependency-free.

## 5. Browser / CI matrix

**Decision**: Same as **004-game-core-logic**: latest **Chrome**, **Firefox**, **Safari** (desktop); **Playwright** project config defines versions; deterministic tests run in **Node + Vitest** without browsers.

**Rationale**: Constitution alignment; no seed-specific engine quirks expected beyond standard JS integers.

## 6. Library / app version drift

**Decision**: Document in tests and copy: **same seed + difficulty** implies **identical** deals only when **`tile-library.json`** entry order and **`gridDimensions`** rules match. No separate version field in v1 unless tasks add **`LIBRARY_REVISION`** constant for future migrations.

**Rationale**: Spec **Assumptions** already allow cross-version drift.

## 7. Post-clarification (Session 2026-04-08): nine-digit hard cap

**Decision**: Keep **`formatMaskedNineDigitsFromRawInput`** (or equivalent) as the single normalizer: strip non-digits, **`.slice(0, 9)`**, then insert hyphens. For **typing**, the controlled input’s **`@input`** handler **MUST** ignore attempts to grow the digit run past nine (same output as previous value when a tenth digit would be appended—**no** reliance on `maxlength` alone, which does not catch all paste/IME paths without the filter).

**Rationale**: **FR-005a** requires **impossible** >9 digits in the canonical digit sequence; slice handles paste; input handler handles incremental typing.

**Alternatives considered**:

- **`maxlength="11"`** (mask length): Helpful but insufficient alone for paste and programmatic fill; keep filter authoritative.

## 8. Post-clarification (Session 2026-04-08): seed change vs **FR-014**

**Decision**: Extend the **Briefcase → `/game`** guard (today: **`in_progress` && selected difficulty ≠ session difficulty**). Also treat **`briefcaseSeedRaw` ≠ session.dealBriefcaseSeedRaw** as a conflict, where **`dealBriefcaseSeedRaw`** is a **string snapshot** of **`GameSettings.briefcaseSeedRaw`** taken when the **in-progress** round **started** (the deal was created). **Direct `/game`** or non–Briefcase starts use **`''`** for that snapshot. On **confirm**, same path as **FR-014**: abandon, reset play, navigate.

**Rationale**: Matches **FR-006a** (“same flow as changing difficulty”) without prompting on every keystroke—only when the user attempts **Unlock** / header **Play** with a mismatched seed vs the deal in memory.

**Alternatives considered**:

- **Prompt on every seed keystroke**: Rejected—breaks **FR-014** parity and UX noise.
- **Compare `seedNine` only**: Rejected—**`''` vs partial** and masked string equality are clearer with raw field snapshot identical to Pinia.
