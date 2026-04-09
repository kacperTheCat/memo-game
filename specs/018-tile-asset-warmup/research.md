# Research: Tile asset warmup and non-blocking board paint (018)

## 1. Why the board appeared “empty” before

**Decision**: The canvas paint loop previously awaited loading **all** deal skin images before drawing any tiles.  
**Rationale**: On cold CDN / cache, that blocked the entire grid even though concealed backs and face placeholders do not require decoded PNGs.  
**Alternatives considered**: Only preload in hub without changing paint order (insufficient for direct `/game`); server-side prerender of board bitmaps (heavy, not SPA-idiomatic).

## 2. Browser cache vs canvas `Image` cache

**Decision**: Warmup uses `new Image()` with the same URL shape as `GameCanvasShell` (`import.meta.env.BASE_URL` + `public` path).  
**Rationale**: Populates HTTP cache and decode pipeline; `GameCanvasShell`’s per-instance `Map` still benefits from fast network layer.  
**Alternatives considered**: Shared global `Image` cache module (more coupling; deferred).

## 3. Idle scheduling

**Decision**: `requestIdleCallback` with a timeout cap; `setTimeout` fallback where unsupported.  
**Rationale**: Keeps hub main thread free for interaction and animations.  
**Alternatives considered**: Immediate `Promise.all` on mount (can jank on mobile).

## 4. Concurrency

**Decision**: Default six parallel image loads during warmup.  
**Rationale**: Balance between throughput and connection contention on slow networks.  
**Alternatives considered**: Fully sequential (slow); unbounded parallel (risky on HTTP/1.1 or constrained devices).

## 5. Stale warmup / difficulty churn

**Decision**: Monotonic generation counter (`tileLoadEpoch` / `warmupGeneration`); stale promise completions ignored for scheduling.  
**Rationale**: User can change difficulty quickly on Briefcase; only the latest batch should drive repaint semantics.  
**Alternatives considered**: Single global flag without generation (race bugs).

## 6. Loading UX copy

**Decision**: English label “Loading artwork…” and `aria-live="polite"` on overlay host.  
**Rationale**: Constitution English UI; polite live region avoids aggressive announcements.  
**Alternatives considered**: Spinner-only (less explicit for sighted users).

## 7. Browser targets

**Decision**: Same as repository defaults—verify on Chromium in CI Playwright; manual spot-check Safari/Firefox for `requestIdleCallback` fallback path.  
**Rationale**: Safari added `requestIdleCallback` in recent releases; timeout fallback covers gaps.

## 8. PWA / Workbox interaction

**Decision**: No change to precache manifest in this feature; warmup complements SW cache on repeat visits.  
**Rationale**: Precache expansion for all `/tiles/*` is a separate ops decision (payload size).  
**Alternatives considered**: Add all tiles to precache (larger install bundle).
