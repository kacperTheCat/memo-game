# Contracts: 015 Vercel deployment & debug peek visibility

## Debug peek UI (informal)

- **Player-visible control**: `data-testid="game-debug-peek-faces"` (button in `GameCanvasShell.vue`).
- **Rule**: The button MUST render only when the app is a **development** bundle **and** the page hostname is **loopback** (see [`../data-model.md`](../data-model.md)). All other cases (including `vite preview`, Vercel production, Vercel preview, `vercel dev` on a public hostname) MUST NOT show the button.
- **Test hooks**: `data-testid="game-memory-debug"` and related **sr-only** nodes remain allowed for E2E; they are not the cheat-style toggle targeted by the spec.

## Vercel project expectations

| Setting | Expected value | Notes |
|--------|----------------|--------|
| Framework | Vite | Auto-detected when possible. |
| Install command | `pnpm install` | Align with repo `packageManager`. |
| Build command | `pnpm build` | Runs `vite build` → `dist/`. |
| Output directory | `dist` | Vite default. |
| Node version | **22.x** | Match root `package.json` `engines.node`. |

**Deep links**: Client routes (`/`, `/game`, `/briefcase`) MUST resolve on refresh; if a deploy shows 404 on direct navigation, add a **`vercel.json`** rewrite from non-asset paths to `/index.html` per Vercel SPA guidance (verify before adding to avoid conflicting with Vite defaults).

**Environment variables**: No new secrets required for this feature. Optional future `VITE_*` vars stay documented in README if introduced.

## Persistence

- **No new `localStorage` / `sessionStorage` keys** for 015.

## Attribution

Unchanged: tile data **[ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API)** (MIT); assets shipped locally per constitution.
