# Quickstart: Post-Match Win Screen (006)

**Plan**: [`plan.md`](./plan.md)

## Prerequisites

- Node **22.x**, **pnpm** (see root `package.json`).
- Dependencies installed: `pnpm install`.

## Verify locally

1. **Dev server:** `pnpm dev` — complete a game on **`/game`** and confirm the **same URL** shows the debrief (board replaced) with correct **time** / **moves** and **History Ledger** rows.
2. **Play Again:** From debrief on **`/game`**, confirm return to **board** and a **new** deal at the **same** difficulty.
3. **Return to Briefcase:** Confirm **`/briefcase`**; **Play Again** must **not** run from that control alone. Open **`/game`** again — **debrief must not** appear until a **new** win (**FR-014**).
4. **Reload on debrief:** On **`/game`** debrief, hard refresh — you should see the **board** in a **new** match (**same difficulty**), **not** the debrief; history still lists the won session (**FR-013**).
5. **Empty ledger:** Clear **`localStorage`** key **`memo-game.v1.completedSessions`** (or use fresh profile), win once — table shows **empty state** while summary still shows the current win.

## Tests

- **Unit / component:** `pnpm test` — includes formatters and any new `.spec.ts` files.
- **E2E:** `pnpm test:e2e` or `pnpm test:e2e:preview` — includes **`e2e/win-game-screen.spec.ts`** once added.

## Design references

- PNG: [`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/inspection_summary_history/screen.png`](../../designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/inspection_summary_history/screen.png)
- HTML export: [`designs/.../code.html`](../../designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/inspection_summary_history/code.html)
