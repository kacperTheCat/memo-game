# Quickstart: deterministic seed (manual checks)

**Plan**: [`plan.md`](./plan.md)

## Prerequisites

```bash
pnpm install
pnpm dev
```

## 1. Masked input

1. Open **`/briefcase`**.
2. Focus **seed** field; type **`123456789`** — expect **`123-456-789`**.
3. Try typing **another digit** — expect value **stays** **`123-456-789`** (no tenth digit).
4. Try typing **letters** — expect **no** change to digit count.
5. Paste **`000000000`** — expect **`000-000-000`**.
6. Paste **`1234567890`** (or longer digit string) — expect **only** first nine digits, e.g. **`123-456-789`**.

## 2. Reproducible deal (two browsers or profiles)

1. Set **same difficulty** (e.g. **Easy**).
2. Enter **same** complete seed (e.g. **`424-242-424`**).
3. Use **Unlock showcase** → **`/game`**.
4. Flip tiles and write down **pair positions** (or screenshot), or use a dev hook if tasks expose **`data-testid`** on cells.
5. Repeat on another session with **same** seed + difficulty — layout **must** match.

## 3. Optional / partial seed

1. Clear seed → start game → expect **varying** layouts across refreshes (non-deterministic).
2. Enter **`12`** only → start — expect **no** deterministic guarantee (same as empty path per spec).

## 3b. Seed change with in-progress game (**FR-006a**)

1. Start a round from Briefcase with a **complete** seed (e.g. **`111-111-111`**) and difficulty **Easy**.
2. Return to **`/briefcase`** (e.g. browser back or nav—however the app allows).
3. Change the seed (e.g. to **`222-222-222`**) or **clear** the field.
4. Click **Unlock** or header **Play** — expect the **same** style of **confirm abandon** dialog as when changing **difficulty** for an in-progress session.
5. On **confirm**, **`/game`** loads a **new** deal consistent with the **current** field + difficulty; on **cancel**, stay on Briefcase with **no** navigation.

## 4. Automated

```bash
pnpm test
pnpm run test:e2e
```

(`e2e/briefcase-seed-layout.spec.ts` after `/speckit.tasks` implementation.)
