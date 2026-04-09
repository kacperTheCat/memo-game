# Research: Wrong-pair tile input during mismatch feedback (016)

## 1. Current behavior (codebase)

- **`pickCell`** (`src/game/memory/memoryEngine.ts`) rejects any pick when **`pair.locked`** is true (lines 35–37). A wrong second tile sets **`locked: true`** (lines 89–98).
- **`useGamePlayStore.tryPick`** starts a **`setTimeout(..., MISMATCH_RESOLVE_MS)`** to call **`clearMismatch`** and **`playSfx('fail')`** when a wrong pair is complete (`src/stores/game/gamePlay.ts`). Constants are shared with the canvas via **`src/game/tiles/tileMotionConstants.ts`** (`TILE_MISMATCH_SHAKE_MS`, `TILE_MISMATCH_FLIP_BACK_MS`, `MISMATCH_RESOLVE_MS`).
- **`GameCanvasShell.vue`** drives shake / flip-back using **`pair.locked`** plus mismatch indices and a local **`mismatchStartedAt`** clock (`mismatchShake`, `mismatchConceal01ForCell`, `computeMismatchPhaseUi`, **`animationActive`**). **`onCanvasPick`** does not gate on **`animationActive`**; rejection is entirely from **`pickCell`** / store.

## 2. Decision: how to allow input without dropping mismatch feedback for players who wait

**Decision:** Treat a **wrong pair** as **“mismatch pending”** using **structural state** (two revealed tiles, different identities, not matched), not **`pair.locked`**, for purposes of **canvas mismatch visuals** and **timer scheduling**. Set **`locked: false`** (or stop using **`locked`** for mismatch—see §3) so **`pickCell`** can accept a **concealed** tile that is **not** part of the pending wrong pair; that path **atomically** applies **`clearMismatch`** then continues as the **first tile** of the next turn (single **`pickCell`** / store transaction or equivalent).

**Rationale:** Matches spec **FR-001** / **FR-003** (same rules: only valid concealed tiles; matched tiles still rejected). Keeps **`MISMATCH_RESOLVE_MS`** timer for players who **do not** tap again: **`clearMismatch` + `fail` SFX** when time elapses. **`tryPick`** must **cancel** the timer on any **accepted** pick and **no-op** the timer callback if the mismatch was already cleared.

**Alternatives considered:**

| Alternative | Why not chosen |
|-------------|----------------|
| Keep **`locked: true`** and only unlock in the UI | Would require bypassing **`pickCell`** or duplicating rules in the shell; violates single source of truth for rules. |
| Always shorten / remove shake | Violates **FR-002** and prior polish intent (**008**): mismatch feedback must remain for the default “wait” path. |
| Allow three face-up tiles in **`MemoryState`** | Harder to reason about matches, persistence, and snapshots; conflicts with **FR-004**. |

## 3. Decision: `pair.locked` semantics

**Decision:** After a wrong second pick, emit **`pair` with `locked: false`** while **`firstIndex`/`secondIndex`** still identify the pending wrong pair until **`clearMismatch`** (timer or interrupt). **Replace** checks that use **`locked && wrong pair`** with a shared helper (e.g. **`isWrongPairPending(state)`**) in engine + canvas + store so visuals and timer do not depend on **`locked`** for mismatch.

**Rationale:** Today **`secondIndex !== null`** blocks further picks (lines 61–63) even if **`locked`** were false; mismatch pending must be handled **before** that guard with an **interrupt** branch. **`locked`** can remain **`false`** for the whole mismatch window so the generic **`locked`** gate does not apply.

**Alternatives considered:** Keep **`locked: true`** and add a **pre-lock** exception path only in **`pickCell`**—equivalent complexity, easier to regress if **`locked`** is reused elsewhere; centralizing on **`isWrongPairPending`** is clearer.

## 4. Visual / FR-002 tradeoff on early interrupt

**Decision (v1):** When the player **interrupts** by picking another tile, **logical** state updates immediately (**conceal** the two wrong tiles, **reveal** the new choice). The canvas may **stop** shake / flip-back for that pair at that instant because **`MemoryState`** no longer marks those cells as the active wrong pair.

**Rationale:** Spec **FR-002** forbids **removing** mismatch feedback **as the implementation trick** to enable input; it does not require **infinite** shake when the player **explicitly** starts a new action. Document for stakeholders: players who **wait** still see the **full** shake + flip-back + **fail** sound; players who **tap through** trade remaining mismatch motion for responsiveness.

**Follow-up (optional polish):** Decouple **decorative** mismatch motion from **`MemoryState`** (e.g. shell-local **`lastMismatchPairUntil`**) so shake can finish while the next tile is already revealed—only if product wants **zero** truncation after interrupt.

## 5. SFX ordering

**Decision:** On **timer** completion: keep **`playSfx('fail')`** with **`clearMismatch`** (current behavior). On **interrupt**: play **`fail`** when the two tiles are **concealed** (same emotional beat as resolution), optionally coexisting with **`flip`** for the new tile—accept brief overlap; align with **`sfxOutcomesForPick`** patterns.

## 6. Browser / CI matrix

Same as repository defaults: **Chromium** in CI (Playwright); developers use **Chrome, Firefox, Safari** latest + LTS channels per constitution. No change for this feature.

## 7. Performance

No new per-frame allocations planned. **Input path** adds one branch (wrong-pair pending + interrupt); stays within existing canvas frame budget.

## 8. Testing map (constitution V)

| Layer | Scope |
|-------|--------|
| **Vitest** | **`memoryEngine`**: wrong pair + interrupt pick sequences; timer no-op when already cleared; **`gamePlay`**: timer start/cancel/interrupt. |
| **Playwright** | **`e2e/game-wrong-pair-input-during-animation.spec.ts`**: deterministic seed or stable deal; after wrong pair, activate another tile **before** mismatch window ends; assert board state / no stuck UI; optional assertion that mismatch still runs when user **does not** interrupt (regression for **FR-002** wait path). |

## 9. Persistence / contracts

**No new `localStorage` keys.** **`SessionSnapshot.pair`** shape unchanged; **`locked`** may be **`false`** during mismatch in saved state—verify **hydrate** + **`tryPick`** still schedule timer if snapshot loads mid-mismatch (edge case).

**Backward compatibility:** Older in-progress snapshots may still have **`pair.locked: true`** during a wrong pair. On **hydrate** (or first **`pickCell`** after load), **normalize** to **`locked: false`** whenever **`isWrongPairPending`** so interrupt logic and timer scheduling stay consistent.
