# Research: Project Setup

**Feature**: 001-project-setup | **Date**: 2026-04-07

## Node.js version

- **Decision**: **Node 22.x** (Active LTS) in `.nvmrc` / `engines` in `package.json` and CI.
- **Rationale**: Stable LTS for Vite 6 + Vitest 3 + Playwright; aligns with GitHub Actions `node-version: 22`.
- **Alternatives considered**: Node 20 LTS—still valid; 22 chosen for longer horizon on a greenfield repo.

## PWA implementation

- **Decision**: **`vite-plugin-pwa`** with `registerType: 'autoUpdate'`, precache of `index.html` + built assets, runtime caching optional for future API (none in setup).
- **Rationale**: Maintained path for Vite; satisfies installability and offline shell without hand-written service worker for MVP.
- **Alternatives considered**: Manual Workbox script—more control, more maintenance; deferred.

## Playwright vs dev server

- **Decision**: **US1 bootstrap** E2E may use `webServer: vite dev` for speed where spec allows “documented start steps” (README `pnpm dev`). **US2 quality gates** and **CI** MUST use `vite build` then `vite preview` on a fixed port (e.g. 4173).
- **Rationale**: Matches constitution and spec FR-004; README documents both “daily dev” and “verify like CI” flows.
- **Alternatives considered**: Preview only for all tests—slower local iteration for TDD on shell.

## Tailwind major version

- **Decision**: **Tailwind v4** via Vite plugin if `create-vue` / ecosystem defaults to it in 2026; else **v3.4** with PostCSS. Lock whichever ships stable with the chosen template in implementation.
- **Rationale**: Constitution requires Tailwind; exact major is tooling-default to reduce friction.
- **Alternatives considered**: UnoCSS—rejected (constitution names Tailwind).

## Browser matrix (manual + CI)

| Channel | Scope |
|---------|--------|
| Chromium | Latest stable + previous major (Playwright bundled Chromium in CI) |
| Firefox | Latest + current **ESR** (spot-check locally; CI optional second job if cost acceptable) |
| Safari | Latest on macOS + current iOS Safari for smoke (local/reviewer; CI typically Chromium-only for free tier) |

**Note**: CI defaults to **Chromium** for speed; README asks reviewers to spot-check Safari/Firefox for recruitment demo.

## Package manager

- **Decision**: **pnpm** with `packageManager` field (Corepack) preferred; **npm** acceptable if contributor friction is lower—pick one in first commit and document in README.
- **Rationale**: Single documented path; pnpm saves disk in hiring scenarios with many clones.
