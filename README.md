# CS2 Memory

Non-commercial **recruitment / portfolio** project: a Counter-Strike 2–themed memory game (in progress). This repository follows [.specify/memory/constitution.md](.specify/memory/constitution.md) (Vue 3, Canvas gameplay later, PWA, TDD, Playwright).

## Getting started

**Prerequisites:** [Node.js 22](https://nodejs.org/) and [pnpm](https://pnpm.io/) (`corepack enable` recommended).

```bash
pnpm install
pnpm dev
```

Open the URL shown in the terminal (default `http://127.0.0.1:5173`). The UI is **English**.

### Edge cases

- **Wrong Node version:** Use Node 22 (see `.nvmrc`). Switch with `nvm use` or install from nodejs.org.
- **Interrupted install:** Run `pnpm install` again; remove `node_modules` only if installs stay corrupted.
- **First visit offline:** You need one **online** session so the app and service worker assets can load. After that, the shell can load offline (see PWA section).

More detail: [specs/001-project-setup/quickstart.md](specs/001-project-setup/quickstart.md).

## Automation & CI

Order matches project constitution (Vitest → build → preview → Playwright):

```bash
pnpm test              # Vitest (unit / component + tile-library validation)
pnpm test:e2e          # Playwright: bootstrap on dev server, then build + preview suite
```

**Tile library:** `pnpm test` fails if `src/data/tile-library.json` is invalid or files under `public/tiles/` are missing. Regenerate with `pnpm run fetch-tiles` (requires network; see [ATTRIBUTION.md](ATTRIBUTION.md)).

Or step-by-step:

```bash
pnpm test
pnpm exec playwright test -c playwright.bootstrap.config.ts   # dev server
pnpm build
pnpm exec playwright test                                     # preview on :4173
```

GitHub Actions (`.github/workflows/ci.yml`) runs the same stages on push/PR.

## PWA, offline, install

After a successful **online** load, the shell is cached and should open **offline** (verify with DevTools → Network → Offline).

**Add to Home Screen / install** is platform-specific; run a **manual** smoke test on Chrome (desktop/Android) or Safari (iOS) once per release. Automated tests cover service worker registration and offline navigation.

## Performance note (FCP)

For the setup shell, do an occasional **First Contentful Paint** check with Chrome DevTools Performance or Lighthouse using **throttled Fast 3G**; target is **under 2 seconds** for the initial shell ([plan](specs/001-project-setup/plan.md)). Not enforced in CI.

## Game imagery provenance

Vendored tile art and `src/data/tile-library.json` come from a **one-time** ingest (`pnpm run fetch-tiles`) using the unofficial [ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API) (MIT). See [ATTRIBUTION.md](ATTRIBUTION.md). This demo is **not** affiliated with or endorsed by Valve or Counter-Strike.

## Scripts

| Script        | Description                                      |
| ------------- | ------------------------------------------------ |
| `pnpm dev`    | Vite dev server                                  |
| `pnpm build`  | Production build to `dist/`                      |
| `pnpm preview`| Serve `dist/` on `http://127.0.0.1:4173`         |
| `pnpm test`   | Vitest (includes CS2 tile library checks)       |
| `pnpm fetch-tiles` | Regenerate `public/tiles/` + `src/data/tile-library.json` |
| `pnpm test:e2e` | Full Playwright pipeline (see above)         |
| `pnpm lint`   | ESLint                                           |

## License

Private / portfolio usage unless otherwise noted.
