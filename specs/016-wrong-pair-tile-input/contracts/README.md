# Contracts: 016 wrong-pair tile input during mismatch feedback

## Client persistence

**No new `localStorage` or `sessionStorage` keys.** Existing snapshot shape remains **`SessionSnapshot`** (`memo-game.v1.inProgress`, append-only completed sessions per **004** / **006**).

**Note:** Snapshots may record **`pair.locked: false`** during a wrong-pair pending window. Restored sessions MUST behave like live play (timer + interrupt rules)—see [`data-model.md`](../data-model.md) hydration note.

## Gameplay contract (informal)

| Rule | Description |
|------|-------------|
| **Interrupt target** | Only **concealed** tiles **not** in the pending wrong pair are accepted during mismatch pending. |
| **Timer** | **`MISMATCH_RESOLVE_MS`** after wrong pair is shown; idempotent clear if already resolved by interrupt. |
| **SFX** | **`fail`** on timer-based clear; on interrupt, **`fail`** when concealing wrong pair (see [`research.md`](../research.md) §5) plus existing **`flip`** / **`success`** rules from **`tryPick`**. |

## Automated testing surface

- **Playwright**: new spec **`e2e/game-wrong-pair-input-during-animation.spec.ts`** (per feature spec). Prefer **seeded** or **stable** deal so tile identities are deterministic; use canvas hit targets or existing accessibility hooks if present.
- **Vitest**: **`memoryEngine.spec.ts`**, **`gamePlay.spec.ts`** extended for interrupt + timer no-op.

## Attribution

Tile imagery and metadata: **[ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API)** (MIT). No runtime API dependency for gameplay (constitution).
