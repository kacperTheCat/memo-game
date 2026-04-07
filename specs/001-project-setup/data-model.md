# Data Model: Project Setup

**Feature**: 001-project-setup | **Date**: 2026-04-07

This feature introduces **no persisted business entities** (no server DB). Below are **configuration and UI surfaces** relevant to implementation and tests.

## ApplicationShell (UI concept)

| Field / concern | Description |
|-----------------|-------------|
| `documentTitle` | English title string (e.g. “CS2 Memory”) |
| `primaryHeading` | English heading visible on root route |
| `canvasHost` | Present: single `<canvas>` with explicit width/height (CSS + attribute) for future game; no tile data |
| `layout` | Responsive: usable width on 320px+ viewports |

## PWA manifest (conceptual)

| Field | Description |
|-------|-------------|
| `name` / `short_name` | English app names |
| `start_url` | `/` |
| `display` | `standalone` or `minimal-ui` |
| `icons` | At least one maskable + any-`png` set under `public/` |

## Service worker caching

| Cache | Contents |
|-------|----------|
| Precache | Built JS/CSS, `index.html`, icons |
| Runtime | None required for setup milestone |

## Client storage (future)

| Store | Status |
|-------|--------|
| Game progress / settings | **Out of scope** for setup; Pinia store scaffold allowed without persistence |

## Repository metadata (documentation)

| Item | Location |
|------|----------|
| Recruitment context | `README.md` |
| CSGO-API attribution | `README.md` (link to [ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API), MIT) |
| One-time ingest | Documented command placeholder (e.g. `pnpm run ingest:assets`)—implementation optional stub |
