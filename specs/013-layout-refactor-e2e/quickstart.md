# Quickstart: 013 layout & visual E2E

## Prerequisites

- Node 22+, `pnpm install`
- Playwright browsers: `pnpm exec playwright install chromium` (CI uses `--with-deps`)

## Run unit tests

```bash
pnpm test
```

## Run E2E (preview build — matches CI main stage)

```bash
pnpm exec playwright test
```

Optional: run a single new file during development:

```bash
pnpm exec playwright test e2e/screens-visual.spec.ts
pnpm exec playwright test e2e/game-layout-balance.spec.ts
```

## Update screenshot baselines

After intentional UI changes:

```bash
pnpm exec playwright test e2e/screens-visual.spec.ts --update-snapshots
```

Commit updated PNGs with the PR.

The home baseline (`home-session-history-table.png`) seeds `memo-game.v1.completedSessions` in the spec so the History Ledger table shows sample won rows; see `e2e/screens-visual.spec.ts`.

## Lint

```bash
pnpm lint
```

## Layout debugging tips

- Compare **header** and **main** column alignment in `GameView.vue` before touching canvas draw code.
- Use Playwright trace on failure: `trace: 'on-first-retry'` is already set in `playwright.config.ts`.
