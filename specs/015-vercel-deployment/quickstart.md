# Quickstart: 015 Vercel deployment & debug peek visibility

## Local verification

### Production-like build (debug button hidden)

```bash
pnpm build
pnpm preview
```

Open `http://127.0.0.1:4173/game` — confirm the **“Debug: faces”** / peek toggle is **not** visible.

### Development server (debug button visible on loopback)

```bash
pnpm dev
```

Open `http://127.0.0.1:5173/game` (or the URL printed by Vite) — confirm the debug peek button **is** visible and toggles faces.

### Optional: dev on LAN IP

If you use `pnpm dev --host 0.0.0.0` and open the app via a **non-loopback** IP, the button is **intentionally hidden** per [`research.md`](./research.md) §2. Use loopback or document a team override if that blocks a workflow.

## Automated tests

```bash
pnpm test
pnpm test:e2e
```

- Main E2E includes a spec that asserts the peek button is **absent** on the **preview** server.
- Bootstrap E2E includes a spec that asserts the peek button is **present** on the **dev** server.

## GitHub Actions (deploy after CI)

The workflow **deploy** job runs only on **push** to `main` or `master`, and only after the **verify** job (tests + lint) succeeds.

Add these **repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Where to get it |
|--------|------------------|
| `VERCEL_TOKEN` | Vercel → Account Settings → **Tokens** → create token with scope to deploy this project. |
| `VERCEL_ORG_ID` | Project → **Settings** → General → **Team / Personal** id (or run `vercel link` locally and read `.vercel/project.json`). |
| `VERCEL_PROJECT_ID` | Same **Settings** → General → **Project ID**. |

If secrets are missing, the **deploy** job fails on the deploy step; **verify** still protects main.

Pull requests only run **verify**, not **deploy** (avoids duplicate preview noise; use Vercel’s Git integration for PR previews if desired).

## Vercel

1. Create/import the Git repository in Vercel; select **Vite** (or static with `dist`).
2. Set **Node** to **22.x** in Project Settings.
3. Deploy **default branch** → production URL; open `/`, `/game`, `/briefcase`.
4. Confirm **no** debug peek button on the game screen on the **hosted** URL.
5. Open a **preview deployment** for a branch and repeat the game-screen check.

## Rollback

Revert the connecting PR or roll back the Vercel deployment to the previous production deployment in the Vercel dashboard.
