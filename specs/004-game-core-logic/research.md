# Research: Game Core Logic (004)

**Spec**: [`spec.md`](./spec.md) | **Plan**: [`plan.md`](./plan.md) | **Date**: 2026-04-07

## 1. Canvas flip (concealed → revealed, left pivot, 180°)

**Decision:** Implement flip/reveal using **Canvas 2D** transforms per tile: `ctx.save()`, translate to the **left edge center** of the cell, `rotate` around Z (2D canvas rotation is in-plane—product spec calls for 180° with left pivot; visually this reads as a card spin; if design requires true **Y-axis** “card flip,” approximate with **scaleX** from 1 → 0 → 1 while swapping back/front draw, or document as **accepted canvas limitation** in a follow-up). For v1, use **rotate + clipped draw** or **scaleX** swap (industry-standard canvas card pattern).

**Rationale:** Keeps rendering on a single surface (constitution II); avoids DOM overlays for faces.

**Alternatives considered:** DOM/CSS card stack per cell (rejected—violates canvas-first); WebGL (overkill for 2D tiles).

## 2. Match removal vs grid reflow

**Decision:** **Logical removal**: matched pair **no longer receives hits** and **no longer draws** tile faces; remaining cells **reflow** into a compact grid **or** keep fixed slots with **empty** cells—spec says “removed from grid.” Prefer **compact reflow** only if layout math stays stable; otherwise **fixed grid with empty slots** is simpler for index-based state. **Default for implementation:** keep **fixed row/col indices** but **skip draw and hit-test** for removed indices (visually “gone”); if product prefers reflow, add a second phase.

**Rationale:** Fixed indices simplify snapshot serialization (`cellId → state`).

**Alternatives considered:** Full dynamic reflow (more complex); DOM list virtualization (out of scope).

## 3. Parallax on canvas

**Decision:** While pointer/touch is over the canvas, compute **normalized offset** per tile center vs pointer; apply **small translate** (or sub-rect source offset) when drawing the **front** image, **clamped** to ±N px; respect **`prefers-reduced-motion: reduce`** (disable or cut intensity ~90%).

**Rationale:** Meets spec FR-006 without extra DOM layers.

**Alternatives considered:** CSS `transform` on a DOM overlay (rejected as primary surface).

## 4. Active-tab-only time

**Decision:** Maintain `activeMs` in session state; increment using `performance.now()` deltas only when **`document.visibilityState === 'visible'`** AND document has focus (listen `visibilitychange`, `focus`, `blur`, `pageshow`). Optionally gate on **`document.hasFocus()`** each tick.

**Rationale:** Matches spec FR-009 and SC-003.

**Alternatives considered:** `Date.now()` on interval always (rejected—inaccurate for background tabs).

## 5. Client persistence format

**Decision:** **`localStorage`** keys under a single namespace: `memo-game.v1.inProgress` (in-progress snapshot) and `memo-game.v1.completedSessions` (JSON array of completed sessions). Payload = **versioned** object matching [`contracts/session-storage.schema.json`](./contracts/session-storage.schema.json).

**Rationale:** Sufficient size for JSON board state at 8×8; synchronous API simplifies Pinia hydration; works offline/PWA.

**Alternatives considered:** `indexedDB` (defer until quota errors); `sessionStorage` (rejected—does not survive full browser close per FR-010).

## 6. Browser matrix (CI vs manual)

**Decision:** **CI**: Chromium (Playwright default). **Manual / periodic**: Firefox + Safari against `pnpm preview` URL.

**Rationale:** Matches constitution “latest + LTS” guidance for a small repo; expand matrix in CI when workflow capacity allows.

**Alternatives considered:** Three-browser CI matrix every PR (higher cost; defer).

## 7. E2E strategy (clarified)

**Decision:** Playwright clicks **one representative cell region** on the canvas (computed from canvas bounding rect + grid metadata `data-rows` / `data-cols` already exposed for a11y) to validate **reveal**, **aria/meta**, and **persistence hooks**; **Vitest** covers pairing, win, mismatch timers, and storage reducers.

**Rationale:** Spec clarification 2026-04-07; keeps CI fast.

**Alternatives considered:** Full-grid e2e (deferred).

## 8. Briefcase difficulty vs live round (clarification 2026-04-07)

**Decision:** Treat Briefcase **difficulty** as **input for the next game start** only. Do **not** `watch` it on `/game` to rebuild mid-session. Run abandon+confirm only when navigating **Briefcase → `/game`** (Unlock or header **Play**) if `in_progress` and selected difficulty ≠ `GameSession.difficulty`. Centralize in **`useBriefcaseNavigateToGame`**.

**Rationale:** Avoids surprise dialogs while browsing radios; matches explicit user intent at “start game”; keeps restore and engine stable.

**Alternatives considered:** Confirm on every radio change (rejected); reactive difficulty watcher on game route (rejected).
