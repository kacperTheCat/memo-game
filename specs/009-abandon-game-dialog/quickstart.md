# Quickstart: 009-abandon-game-dialog

## Prerequisites

- Node **22.x**, **pnpm** (see root `package.json`).

## Develop

```bash
cd /path/to/memo-game
pnpm dev
```

1. Start a game from the briefcase; on `/game`, click **Abandon Game** → in-app dialog appears (not browser confirm).
2. **Cancel** → remain in game; session still **in_progress**.
3. **Abandon** → routed to briefcase; session **abandoned** per stats rules.
4. With **in_progress** session, click **Unlock showcase**: dialog appears **even if** difficulty/seed still match the in-progress deal → cancel stays on briefcase; confirm abandons and starts a **new** game from current Briefcase settings.
5. (Optional) Change difficulty or seed so they **mismatch** the in-progress deal → **Unlock** still shows dialog (copy may differ if two strings are implemented).

## Tests

```bash
pnpm test
pnpm run test:e2e:preview
```

Focus E2E:

```bash
pnpm exec playwright test e2e/abandon-confirmation-dialog.spec.ts
```

## Regression

- Run full **`pnpm test && pnpm run lint`** before merge (repo guideline).
- Ensure **`BriefcaseView.spec.ts`** and **`GameView`** tests no longer rely on **`window.confirm`** without updating assertions to dialog testids.
