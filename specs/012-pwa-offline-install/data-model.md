# Data model: PWA offline persistence and install prompt (012)

## Overview

This feature adds **two** versioned `localStorage` documents alongside existing **004** session keys. It does **not** change **`SessionSnapshot`** (`memo-game.v1.inProgress`) or **`CompletedSessionRecord[]`** (`memo-game.v1.completedSessions`) schema versions.

## Entity: `PlayerSettingsV1` → key `memo-game.v1.playerSettings`

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `schemaVersion` | `1` | yes | Bump only with a migration story. |
| `difficulty` | `'easy' \| 'medium' \| 'hard'` | yes | Mirrors `useGameSettingsStore.difficulty`. |
| `briefcaseSeedRaw` | `string` | yes | May be `''`; mirrors briefcase input. |

**Validation:** Reject / ignore document if `schemaVersion !== 1` or invalid `difficulty`; fall back to store defaults (`medium`, empty seed).

**Write policy:** Debounced writes (e.g. **~300ms**) after store changes to avoid synchronous `localStorage` churn; mirror **`gameSession`** debounce pattern.

**Read policy:** Hydrate **once** at app bootstrap (after Pinia created), before first route that reads settings; **URL query** `?difficulty=` / `?seed=` may still override **then** optionally sync back to persisted settings (implementation detail: document in `contracts/README.md`).

**Excluded:** `dealSeed`, `briefcaseSeedIncompleteAfterBlur` — not persisted (ephemeral UX / one-shot deal).

## Entity: `PwaInstallUiStateV1` → key `memo-game.v1.pwaInstallUi`

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `schemaVersion` | `1` | yes | Bump only with migration. |
| `outcome` | `'pending' \| 'seen' \| 'dismissed' \| 'installed'` | yes | **`pending`** = invitation not yet shown (or fresh after clear). **`seen`** = sheet was shown at least once so reload does **not** show again until site data cleared (covers “once” before user taps Install or Not now). **`dismissed`** = explicit **Not now**. **`installed`** = `appinstalled` fired or standalone display mode detected. |

**State transitions:**

1. **Initial / missing key:** treat as **`pending`** when install API eligible and not standalone → may show sheet.
2. **On first display** of the sheet → persist **`seen`** immediately (prevents repeat on refresh if user ignores the panel).
3. User **dismisses** → persist **`dismissed`**.
4. **`appinstalled`** or **standalone detected** → persist **`installed`**.
5. User clears site data → all keys removed → back to (1).

## Relationships

- **`PlayerSettingsV1`** is independent of session snapshots; briefcase and `/game` both consume the same Pinia store after hydration.
- **`PwaInstallUiStateV1`** is independent of game state.
- **`memo-game.v1.inProgress`** remains the source of truth for mid-round restore (**FR-001**); snapshot already includes **`session.difficulty`** for consistency on restore (**004** contract).

## Session / tab keys (unchanged)

- **`memo-game.v1.reloadNewGameDifficulty`** (`sessionStorage`) — unchanged; still tab-scoped debrief → reload flow (**006**).
