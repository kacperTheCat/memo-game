# Quickstart: 003 tile library & Game grid

## Prerequisites

- **Node.js 22.x** (see `package.json` `engines`)
- **pnpm** 9.x

## Install

```bash
pnpm install --frozen-lockfile
```

## Generate tiles + `tile-library.json`

Run the maintainer script (path finalized in tasks—e.g.):

```bash
pnpm run fetch-tiles
```

This should:

1. Fetch or read ByMykel CSGO-API skin data.
2. Write images under `public/tiles/`.
3. Write `src/data/tile-library.json` (32 entries: `id`, `rarity`, `color`, `imagePath`).

Commit generated assets so CI does not require network (or run the script in CI before `vite build` if policy changes).

## Validate data

```bash
pnpm test
```

Vitest includes library validation tests (32 entries, files on disk).

## Run app

```bash
pnpm dev
```

1. Open **The Briefcase**, choose **Easy / Medium / Hard**.
2. Open **Play** (`/game`). Grid dimensions should match **4×4 / 6×6 / 8×8**.

## E2E

```bash
pnpm run test:e2e:preview
```

Covers Briefcase → Game grid meta (`e2e/csgo-tile-library-game.spec.ts`) and US3 cell counts (`e2e/csgo-tile-library-validation.spec.ts`).

## Attribution

Tile metadata and source image references trace to **[ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API)** (MIT). Keep `ATTRIBUTION.md` or README section updated when regenerating data.
