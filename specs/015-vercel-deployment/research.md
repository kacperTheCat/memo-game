# Research: 015 Vercel deployment & debug peek visibility

## 1. Current behavior (`GameCanvasShell.vue`)

- **Visibility flag**: `showDebugPeekButton = import.meta.env.DEV` (Vite compile-time).
- **Production preview** (`pnpm build` + `pnpm vite preview`): `import.meta.env.DEV` is **false** → button already **hidden**. Main Playwright suite (`playwright.config.ts`) therefore runs against a build **without** the debug button.
- **Dev server** (`pnpm dev`): `import.meta.env.DEV` is **true** → button **shown**. Bootstrap E2E (`playwright.bootstrap.config.ts`) uses the dev server.

## 2. Gap: “dev build” on a non-loopback host

**Problem**: Tools such as **`vercel dev`** (or any tunnel) can serve a **development** bundle (`import.meta.env.DEV === true`) while the browser’s **hostname** is **not** loopback (e.g. `*.vercel.app`, ngrok). Today the debug peek button would **appear** on that URL, which violates the spec’s “non-local = hide” rule.

**Decision**: Treat “show debug peek UI” as **`import.meta.env.DEV` AND loopback hostname** (and safe SSR/build behavior).

**Rationale**: Aligns with spec assumptions (local = typical dev origins on loopback) and closes the tunnel / `vercel dev` loophole without affecting production or `vite preview` builds.

**Alternatives considered**:

| Alternative | Rejected because |
|-------------|------------------|
| Custom `VITE_SHOW_DEBUG_PEEK=1` only | Extra env discipline; easy to mis-set on hosted previews. |
| `import.meta.env.PROD` only (inverse) | Already true for preview; does not fix `vercel dev` + DEV true. |
| Hostname-only (no `DEV` check) | Would hide button if someone served a production build on localhost with wrong headers — uncommon; still prefer `DEV && loopback` for clarity. |

**Loopback detection** (browser only): hostname in `localhost`, `127.0.0.1`, `[::1]` (case-insensitive for `localhost`). For Vitest/`happy-dom`, hostname is often `localhost` — keep tests explicit via env or mount context.

## 3. Vercel deployment (Vite SPA)

**Decision**: Use Vercel’s **Vite** preset: install command `pnpm install`, build `pnpm build`, output **`dist`**, Node **22** to match `package.json` `engines`.

**Rationale**: First-class support; no custom server; static + client routing.

**Alternatives considered**:

| Alternative | Notes |
|-------------|--------|
| Netlify / Cloudflare Pages | Valid; spec assumes Vercel only. |
| Docker + VM | Overkill for static SPA. |

**SPA routing**: Vercel rewrites for Vite typically serve `index.html` for non-file routes; verify **`/game`** and **`/briefcase`** deep links after first deploy. Add root **`vercel.json`** only if a project-specific rewrite or header is required (see [`contracts/README.md`](./contracts/README.md)).

**PWA / service worker**: Ensure **HTTPS** on Vercel (default). Confirm **scope** and **start_url** in existing manifest remain `/` (already in `vite.config.ts`).

## 4. Playwright coverage split

| Scenario | Approach |
|----------|----------|
| Non-local / production-like: button **absent** | New spec under `e2e/` included in **`playwright.config.ts`** (preview on `127.0.0.1:4173`): assert `data-testid="game-debug-peek-faces"` is **not attached** (count 0). |
| Local dev: button **present** | New small spec under **`e2e/project-setup/`** included in **`playwright.bootstrap.config.ts`** `testMatch`: open `/game`, assert button **visible**. Keeps one dev `webServer` for both bootstrap + this check. |

**Rationale**: Two servers cannot run in one Playwright config file without multi-project duplication; reusing bootstrap’s dev server satisfies constitution Playwright mapping for both acceptance paths.

## 5. Vitest

- Unit-test **`isLoopbackHostname()`** (or the composed `showGameDebugPeekUi` helper) for `localhost`, `127.0.0.1`, `[::1]`, and at least one **non-loopback** negative (`example.com`, `192.168.1.1`).
- Extend **`GameCanvasShell.spec.ts`** if the visibility rule moves to a composable/helper so component tests still assert toggle behavior when the flag is forced on.

## 6. Browser matrix (constitution)

- **CI**: Chromium (existing).
- **Manual smoke after deploy**: Latest Chrome or Edge + one mobile Safari session for PWA install / offline sanity (unchanged from project norms).

## 7. Performance

- Hostname check is **O(1)** on a rare code path (component setup); no frame budget impact.
