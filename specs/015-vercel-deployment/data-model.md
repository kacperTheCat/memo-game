# Data model: 015 Vercel deployment & debug peek visibility

This feature introduces **no new persisted entities** (`localStorage` / `sessionStorage` / IndexedDB). It adds **runtime classification** for UI gating and **hosting configuration** as code.

## Runtime: debug peek visibility

| Concept | Description | Validation |
|--------|-------------|------------|
| **Development bundle** | Vite `import.meta.env.DEV === true` | Compile-time; standard Vite semantics. |
| **Loopback host** | Browser `location.hostname` is one of: `localhost` (case-insensitive), `127.0.0.1`, `[::1]` | Pure function testable in Vitest. |
| **Show debug peek control** | `DEV && loopbackHost` (see [`research.md`](./research.md) §2) | E2E: absent on preview build; present on dev server in bootstrap suite. |

## Configuration: deployment (Vercel)

| Concept | Description |
|--------|-------------|
| **Build artifact** | Static files under `dist/` after `pnpm build` (Vite default). |
| **Deployment record** | Vercel project + Git integration (branch → preview, default branch → production); not stored in app schema. |

## Relationships

- **Debug peek visibility** depends only on **build mode** + **current URL host** at runtime; no Pinia store.
