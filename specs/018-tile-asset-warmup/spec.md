# Feature Specification: Tile asset warmup and non-blocking board paint

**Feature Branch**: `018-tile-asset-warmup`  
**Created**: 2026-04-09  
**Status**: Implemented (documented retroactively)  
**Input**: User description: "Tile artwork loads without blocking the game board: show tile backs and face placeholders immediately, a clear loading state while skin PNGs resolve, and background preload of the correct tile image set from Home and Briefcase based on selected difficulty so navigation to the game feels faster."

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

**Design note:** Loading overlay copy is a small utility label; no new Stitch screen required—styling follows existing memo surface / border tokens in `GameCanvasShell.vue`.

### User Story 1 - Playable board before all skins finish loading (Priority: P1)

On a cold or slow network, the player opens the game and sees the memory grid (tile backs and non-image face placeholders where needed) without a long empty canvas. While skin images are still loading, the UI communicates that artwork is in progress. When loading fails catastrophically for the current deal, the experience degrades in a defined way.

**Why this priority**: Removes the perception of a broken or frozen board on first paint—core trust in the canvas experience.

**Independent Test**: Open `/game` with a seeded deal; observe grid structure and loading affordance until `aria-busy` clears; verify no regression on visual baselines that wait for a settled board.

**Playwright coverage**: `e2e/tile-asset-warmup.spec.ts` (direct `/game` — scenarios 1–2); `e2e/screens-visual.spec.ts` (shell screenshot waits for settled assets — scenario 1). Vitest: `src/game/tiles/tileImagePreload.spec.ts` (subset paths only; see US2).

**Acceptance Scenarios**:

1. **Given** a new or restored in-progress session on `/game`, **When** the canvas first paints, **Then** the grid of tiles (backs and/or placeholders) is visible without waiting for every skin PNG to finish loading.
2. **Given** skin PNGs for the current deal are not all ready, **When** the player views the game canvas, **Then** a clear English loading affordance is shown and the canvas exposes `aria-busy` until artwork for that deal is ready (or a fatal load state applies).
3. **Given** a fatal error loading artwork for the current deal, **When** the canvas handles the error, **Then** the board shows a defined fallback state rather than a partially interactive broken grid.

---

### User Story 2 - Hub routes warm the likely skin set (Priority: P2)

From Home or The Briefcase, the app uses idle time to fetch and decode the PNG set that matches the **selected difficulty** (same subset rules as the deal: first *n* library entries per difficulty). When the player then navigates to `/game`, skins are more often already in the HTTP cache, reducing pop-in and time-to-ready artwork.

**Why this priority**: Improves repeat path and “configure then play” without changing game rules or persistence.

**Independent Test**: Visit hub routes, then open `/game`; automated checks assert the loading overlay is not stuck and the canvas becomes non-busy within a bounded timeout (warm cache makes this fast locally).

**Playwright coverage**: `e2e/tile-asset-warmup.spec.ts` (home → briefcase → game path — scenario 1). Vitest: `src/game/tiles/tileImagePreload.spec.ts` (path list per difficulty aligns with `buildGridLayout`).

**Acceptance Scenarios**:

1. **Given** the player has visited Home, **When** they later open `/game` for the current default difficulty, **Then** the app may have started background loading of that difficulty’s skin PNGs without blocking hub interaction.
2. **Given** the player changes difficulty on The Briefcase, **When** they stay on or return to hub flows, **Then** the app targets the updated difficulty’s skin subset for background warmup.
3. **Given** the player opens `/game` via a deep link without visiting hub first, **Then** the game still functions correctly; warmup on hub is an optimization only.

---

### Edge Cases

- User switches difficulty on Briefcase quickly: only the latest scheduled warmup should affect which batch is logically “current” (stale completions must not cause inconsistent UI).
- Direct `/game` visit: no hub warmup; P1 behavior still applies.
- Partial network failure for one PNG: individual failures should not strand the entire board in an infinite loading state where the spec requires progress (placeholders / defined error path per FR).
- Reduced motion and touch-only play: loading affordance must not block pointer input to the canvas; overlay is non-interactive.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game canvas MUST paint the tile grid (including concealed backs) without blocking on completion of all skin image network loads for the current deal.
- **FR-002**: Until all skin images for the current deal are ready, the shell MUST expose a machine-discernible busy state on the canvas (`aria-busy`) and a short English label for sighted users.
- **FR-003**: Face rendering for revealed or matched cells MUST use an acceptable placeholder when a skin image is not yet decodable; when the image becomes ready, the board MUST update without requiring a manual reload.
- **FR-004**: If loading fails in a way that prevents showing the deal’s artwork, the canvas MUST fall back to a full-board error treatment defined by the product (solid fallback fill), rather than silently showing an empty grid.
- **FR-005**: Home MUST schedule background warmup for the skin PNG set implied by the **current** Pinia difficulty default when the view mounts.
- **FR-006**: The Briefcase MUST schedule background warmup on mount and whenever the selected difficulty changes, for the skin PNG set implied by that difficulty.
- **FR-007**: Warmup MUST NOT introduce new persisted client keys; it MUST NOT block primary navigation or form interaction on hub views.
- **FR-008**: Warmup SHOULD use idle scheduling and bounded concurrency so hub scrolling and taps remain responsive.

### Key Entities

- **Deal skin subset**: The ordered list of skin image paths for the active deal, derived from difficulty → count *n* → first *n* entries in the tile library (same as grid build rules).
- **Warmup generation**: Ephemeral token tying in-flight image loads to the current deal or difficulty selection so stale callbacks do not repaint incorrectly.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual testing on throttled “Fast 3G” (or equivalent), the player sees a full tile grid layout within one second of the game shell becoming visible, even when full skin decode completes later.
- **SC-002**: On a successful load, the loading affordance disappears within ten seconds on the reference CI Playwright run (local cache usually much faster).
- **SC-003**: No new user-visible non-English strings are introduced in product UI for this feature.
- **SC-004**: Automated tests cover: (a) path selection per difficulty in Vitest, (b) settled canvas / non-stuck busy state in Playwright for direct game and hub-then-game paths.

## Assumptions

- Tile library size and per-difficulty *n* remain as today (easy 8, medium 18, hard 32 paths).
- “Fatal” image errors for the deal are rare; the fallback is an acceptable degraded experience.
- Service worker / PWA caching may still delay first visit; warmup improves subsequent navigations and repeat sessions.
