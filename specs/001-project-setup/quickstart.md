# Quickstart: Project Setup

**Branch**: `001-project-setup` | **Spec**: [spec.md](./spec.md)

## Prerequisites

- **Node.js 22.x** (see `research.md`; use `.nvmrc` if present)
- **pnpm** (recommended) or **npm** as documented in `README.md`
- **Git**

## First-time bootstrap (US1)

```bash
git clone <repo-url> memo-game
cd memo-game
corepack enable   # if using pnpm via packageManager field
pnpm install
pnpm exec playwright install --with-deps chromium   # first time only, for E2E
pnpm dev
```

Open the printed local URL (default `http://127.0.0.1:5173`). You should see the **English** shell and a **Canvas** placeholder area.

## Run automated checks locally (US2)

Matches CI / constitution (**Vitest → bootstrap E2E on dev → build → preview E2E**):

```bash
pnpm test
pnpm test:e2e
```

`test:e2e` runs `playwright.bootstrap.config.ts` (dev server), then `pnpm build`, then `playwright.config.ts` (preview on port **4173**).

**Step-by-step equivalent:**

```bash
pnpm test
pnpm exec playwright test -c playwright.bootstrap.config.ts
pnpm build
pnpm exec playwright test
```

## PWA smoke (US3)

1. Run `pnpm build && pnpm preview`.
2. Open `http://127.0.0.1:4173`, wait for full load (service worker active).
3. Use browser DevTools → Network → Offline; reload—shell should still appear (repeat a few times to match **SC-003**).
4. Where supported, use “Install app” / Add to Home Screen (**manual** smoke; see README).

## Performance (optional)

For **FCP** on the shell: Chrome DevTools → Performance or Lighthouse with **Fast 3G** throttle; aim **under 2s** per [plan.md](./plan.md). Documented in root `README.md`; not run in CI.

## Troubleshooting

- **Port in use**: Change `preview` port in `playwright.config.ts` `webServer` / `package.json` `preview` script consistently.
- **Playwright browsers missing**: `pnpm exec playwright install --with-deps chromium` (or `playwright install` for all browsers).
- **Wrong Node version**: Switch to 22.x per `engines` / `.nvmrc`.
