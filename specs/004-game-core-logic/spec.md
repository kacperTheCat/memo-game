# Feature Specification: Game Core Logic

**Feature Branch**: `004-game-core-logic`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "Game - Core logic — tiles on ~1200px width window, bigger tiles, tile size reactive to container width, parallax on mouse/touch, padding between tiles, tiles start rotated 180° on Z (left hinge), click to uncover, matching pair removes from grid, mismatch flips both back, classical memo, track clicks/difficulty/time per session, restore session after close, time only while tab active, persist sessions for future statistics (separate feature)."

## Clarifications

### Session 2026-04-07

- Q: What should initial Playwright end-to-end coverage include? → A: E2E tests only check behavior of one representative tile (minimal surface) for now; exhaustive all-tiles / full-grid e2e is deferred to a later iteration; broader behavior is covered with Vitest in the interim.
- Q: How should players abandon a round and how does that affect statistics storage? → A: Provide an **Abandon game** control (English copy) at the **top-left** of the game screen; when used, the system ends the round and appends a **completed session record** with **outcome `abandoned`** (including difficulty, **tile click count**, and active play time) for the future statistics feature, then clears in-progress persistence.

### Session 2026-04-07 (analysis remediation)

- **Tile faces vs logic**: The visible item for each cell MUST be derived from `identityIndex` using the **same** distinct-identity count `n` as the active deal (`n = cell_count / 2` for standard presets). Using a different `n` (e.g. from UI difficulty while the loaded board is another size) MUST NOT happen, or many cells can share one artwork while matching logic still uses numeric identities—players perceive “duplicate images” and broken pairs.
- **Restore parity**: Reloading an in-progress snapshot MUST reapply **`session.difficulty`** to the shared difficulty setting (or keep paint, hit-testing, and identity mapping on one consistent source) so **easy / medium / hard** grids stay clickable and visually aligned after refresh.

### Session 2026-04-07 (difficulty as init parameter)

- Q: How should **The Briefcase** difficulty interact with an in-progress round, and when should confirmation appear? → A: Difficulty on **The Briefcase** is a **parameter for starting the next game**, not a live reactive control: changing the selection MUST **not** show a dialog and MUST **not** rebuild or abandon the current round. The app MUST **not** watch difficulty to restart a deal mid-session on `/game`. When the player leaves **The Briefcase** for **`/game`** via **Unlock showcase** or the **Play** control in the Briefcase header, if **`GameSession.status === 'in_progress'`** and the selected difficulty **differs** from **`GameSession.difficulty`**, the system MUST then prompt (English) to abandon the current round (same completed-record semantics as **Abandon game**); **Cancel** MUST keep the user on **The Briefcase** and MUST not navigate; **Confirm** MUST abandon, clear in-progress storage, reset play, then proceed to `/game` to start a new deal at the selected difficulty.

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan. *(No Stitch reference required for this feature unless design assets are added later.)*

### Automated test scope (initial delivery)

For this feature’s first implementation wave, Playwright specs intentionally assert behavior **through one representative tile** (or the smallest interaction surface that still validates the scenario), to keep CI time reasonable. Full-grid and every-tile e2e is explicitly **out of scope** until a later test hardening pass. **Vitest** SHOULD cover multi-tile logic, pairing rules, and session/state behavior in the meantime.

### User Story 1 - Play a classical memory round (Priority: P1)

A player opens the game, sees a grid of concealed tiles, flips two at a time, removes matching pairs from the board, and sees non-matching pairs return to the concealed state until all pairs are cleared.

**Why this priority**: This is the essential product—a memory game without correct flip/match/mismatch behavior is not shippable.

**Independent Test**: Start a round, flip tiles, verify match removal and mismatch concealment without relying on layout or analytics.

**Playwright coverage**: `e2e/game-core-playthrough.spec.ts` — scenarios 1–4 in this story, exercised initially via **single-tile** (or minimal) checks; full multi-tile playthrough in e2e deferred.

**Acceptance Scenarios**:

1. **Given** a new round has started, **When** the player selects a concealed tile, **Then** that tile reveals its item and remains revealed until rules say otherwise.
2. **Given** one tile is revealed and no pair is being resolved, **When** the player selects a second concealed tile, **Then** the second tile reveals its item.
3. **Given** two tiles are revealed and show the same item, **When** the pair is resolved, **Then** both tiles are removed from active play (they no longer accept input and no longer occupy the grid as playable cells).
4. **Given** two tiles are revealed and show different items, **When** the mismatch is resolved, **Then** both tiles return to the concealed state (item hidden again).
5. **Given** two tiles are revealed, **When** the player tries to select additional tiles before the current pair is resolved, **Then** the game ignores or defers those inputs according to classical memory rules (no more than two face-up items awaiting resolution at once).

---

### User Story 2 - Responsive board, spacing, and motion (Priority: P2)

A player uses a desktop-sized window (~1200px content width target) or a smaller window; tiles appear larger than a minimal thumbnail, scale down when the container is narrower, have clear spacing between them, start concealed with a visible back, and show a subtle depth motion tied to pointer or touch position.

**Why this priority**: Readability and polish differentiate the experience; gameplay (P1) can be tested before this is final.

**Independent Test**: Resize the viewport and move pointer or finger; verify tile size, gaps, initial concealed state, and motion without completing a full game.

**Playwright coverage**: `e2e/game-core-layout-motion.spec.ts` — scenarios 1–5 in this story, exercised initially via **single-tile** (or minimal) checks where applicable (motion may be limited to interaction hooks or reduced-motion behavior); full-board layout e2e deferred.

**Acceptance Scenarios**:

1. **Given** a wide desktop-style viewport, **When** the game board is shown, **Then** the board layout targets roughly 1200 pixels of content width (including reasonable side margins) and tiles are visibly larger than a compact icon grid.
2. **Given** the viewport width decreases, **When** the board is shown, **Then** tile size decreases relative to the available container width so the grid remains usable without requiring horizontal scrolling in typical phone and tablet widths.
3. **Given** the board is visible, **When** the player views the grid, **Then** adjacent tiles are separated by a small, consistent gap (padding) that stays readable at different sizes.
4. **Given** a new round, **When** tiles first appear, **Then** each tile is in a concealed state (item not visible); the concealed presentation includes a left-hinged rotation effect consistent with a card back facing the player (initial orientation hides the item).
5. **Given** the board is active, **When** the player moves the pointer or drags a touch across the board area, **Then** each tile’s visible surface responds with a subtle parallax-style shift that follows input (strength bounded so it does not harm readability).

---

### User Story 3 - Session metrics, active time, and restore (Priority: P3)

A player’s current round records how many tile selections occurred, which difficulty was chosen, and how long they were actively playing; leaving the tab or minimizing the browser pauses time counting. If the browser or tab is closed and reopened on the same device, the in-progress session (board state and metrics) is restored. The player may **abandon** the round via a **top-left** control; abandoned rounds are stored like other completed sessions (for statistics). Completed **wins** and **abandons** are stored locally for a future statistics feature (display out of scope here).

**Why this priority**: Persistence and metrics support retention and the roadmap statistics screen; core play (P1) remains viable without them.

**Independent Test**: Play partially, blur tab, close browser, reopen; verify counts, difficulty, elapsed active time, and board continuity via stored data (validated in automated tests with storage shims where needed).

**Playwright coverage**: `e2e/game-core-session-persistence.spec.ts` — scenarios 1–5 in this story, exercised initially via **single-tile** (or minimal) checks; full session e2e across the whole grid deferred.

**Acceptance Scenarios**:

1. **Given** a session is in progress, **When** the player selects tiles, **Then** the session’s click count increases by one per successful tile selection (or per the product’s consistent definition of a “click” for memo play).
2. **Given** a session starts, **When** the player chose or confirmed a difficulty, **Then** that difficulty is recorded for the session.
3. **Given** a session is in progress, **When** the game tab is visible and the document is focused, **Then** elapsed “play time” for the session advances; **When** the tab is hidden, unfocused, or the window is minimized, **Then** play time does not advance.
4. **Given** an in-progress session with known board state and metrics, **When** the user closes the browser or tab and later returns on the same device and browser profile, **Then** the same round state and session metrics are restored so play can continue, **and** the chosen **difficulty** used for that round remains applied to shared settings so the grid layout and tile imagery stay consistent with the restored board.
5. **Given** a session ends in a **win**, **When** the round completes, **Then** a durable local record exists containing at least difficulty, **total tile clicks**, active play time, and **outcome `won`** so a future statistics feature can consume them (this feature does not require showing that list).
6. **Given** a session is in progress, **When** the player activates **Abandon game** (control at the **top-left** of the game view, English label), **Then** the round ends, a durable local record is appended with **outcome `abandoned`** and the same minimum fields as a win (difficulty, **total tile clicks**, active play time, ordering id/timestamp), and the **in-progress** snapshot for that session is cleared so restore does not resurrect an abandoned round.

---

### Edge Cases

- Two quick taps on the same already-revealed tile should not corrupt pair logic or double-count in ways that break win detection.
- Storage unavailable (private mode, quota exceeded, user cleared site data): the game remains playable; persistence and restore degrade gracefully with a clear, non-technical message if needed.
- Extreme narrow widths: grid may reflow to fewer columns; tiles remain tappable targets where the platform allows.
- Reduced motion: parallax or rotation intensity should respect the user’s motion preferences when the platform exposes them.
- First visit with no saved session: new round starts with defaults consistent with existing product rules for difficulty.
- Accidental **Abandon game**: the product **SHOULD** guard with a confirmation step or equivalent pattern so one stray tap does not skew statistics; exact pattern is left to implementation if it remains quick to dismiss.
- **Briefcase** difficulty selection during **`in_progress`**: changing radios MUST NOT prompt; the in-flight round and session remain until the player starts a new game from **Unlock showcase** (or uses **Abandon game** on `/game`) per **FR-014**.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST implement classical memory matching: tiles start concealed; up to two selections reveal items; matching pairs leave the grid; non-matching pairs return to concealed state.
- **FR-002**: The system MUST prevent invalid parallel selections beyond the classical two-tile reveal rule (exact behavior: ignore extra input until the current pair resolves).
- **FR-003**: The game board MUST size tiles relative to the container width so that smaller viewports yield smaller tiles and larger viewports yield larger tiles, with a desktop reference layout around 1200px content width.
- **FR-004**: The grid MUST show spacing between tiles at all supported sizes.
- **FR-005**: Tiles MUST begin each round in a concealed state with a visible back; concealed state MUST include a 180° rotation so the item faces away, with the rotation pivot on the left side of the tile (item hidden until reveal).
- **FR-006**: The system MUST apply a parallax-style response on each tile tied to pointer position or touch movement over the board, without blocking normal selection.
- **FR-007**: The system MUST count and retain per-session **total tile-selection clicks** (or equivalent primary input count) for the active round; this **click count** MUST be stored on the in-progress snapshot and on **completed session records** so a future statistics feature can aggregate player effort (same metric as FR-011).
- **FR-008**: The system MUST record the difficulty level associated with each session.
- **FR-009**: The system MUST measure session duration using only time while the game tab is open and active (visible and focused); inactive periods MUST NOT add to that duration.
- **FR-010**: The system MUST persist in-progress session state (including board layout, revealed/matched state, and metrics) to device-local storage so it survives tab or browser closure on the same device profile.
- **FR-011**: The system MUST persist completed session records locally (minimum: difficulty, clicks, active play time, **outcome** `won` | `abandoned`, and an identifier or timestamp usable for ordering) for consumption by a future statistics feature; displaying statistics is explicitly out of scope for this specification.
- **FR-012**: The game view MUST expose an **Abandon game** control (English user-visible label) anchored at the **top-left** of the game layout; activating it MUST end the round, append a completed record per FR-011 with **outcome `abandoned`**, clear the in-progress snapshot for that session (FR-010), and MUST NOT increment tile clicks solely because the user opened the abandon control without confirming (if a confirmation step is implemented per Edge Cases).
- **FR-013**: For the active round, mapping each cell’s **`identityIndex`** to a **`TileEntry`** / image MUST use the same identity universe **`n`** as that deal (for standard grids: **`n = (number of cells) / 2`**, matching the difficulty preset’s pair count). Paint, hit-testing, and engine state MUST all target the same row/column grid as the stored cells; implementations MUST NOT derive **`n`** for faces from a stale global difficulty while a different-sized board is loaded.
- **FR-014**: **The Briefcase** difficulty control MUST act as **input for initializing the next game** only: changing it MUST NOT prompt and MUST NOT alter the active round or session. The **`/game`** route MUST NOT restart or rebuild a deal solely because the stored difficulty preference changed while the view is mounted. When the player navigates from **The Briefcase** to **`/game`** (**Unlock showcase** or **Play** in the Briefcase header) while **`GameSession.status === 'in_progress'`** and the selected difficulty **≠** **`GameSession.difficulty`**, the system MUST prompt (English) to confirm abandoning the current round; on **confirm**, MUST append a completed record with **outcome `abandoned`**, clear in-progress storage (FR-010), reset play state, then navigate to **`/game`**; on **cancel**, MUST remain on **The Briefcase** without navigation.

### Key Entities

- **Game session**: One round from start to completion (**won** or **abandoned**); attributes include **difficulty**, **tile click count** (for statistics), **active play time**, **completion outcome**, and timestamps as needed for ordering.
- **Session snapshot**: Serializable state of the board (which items where, which tiles matched, which are face-up pending resolution) plus the session metrics above for restore.
- **Tile (play element)**: Concealed or revealed state, identity of the item it carries, matched/removed flag, position in the grid.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Classical rules (reveal, match removal, mismatch concealment, win) are verified by automated tests: **Vitest** for core logic and multi-tile state; **Playwright** initially covers **single-tile** (or minimal) representative interactions aligned with user story 1. Full-grid classical flows in e2e are deferred per clarifications.
- **SC-002**: When viewport width is reduced by 40% from a desktop reference, average tile footprint (width or area) decreases measurably with no mandatory horizontal scroll for the board in standard mobile emulation presets used by the project.
- **SC-003**: With the tab backgrounded for a fixed interval (e.g. 30 seconds), recorded active play time increases by no more than one second over that interval (accounting for measurement granularity).
- **SC-004**: After a full browser restart simulation in tests, at least 95% of repeated trials restore the in-progress board and metrics (including **tile click count** and **difficulty** still driving the same grid size and tile imagery) without user re-entry (excluding environments where storage is disabled). **Primary verification**: automated **Vitest** harness with many repeated serialize/hydrate cycles; **Playwright** may provide an additional smoke only (per initial e2e scope clarifications).
- **SC-005**: Players report (or testers observe) that parallax motion is noticeable but does not prevent identifying or tapping tiles on both pointer and touch devices.

## Assumptions

- “Classical memory” means fixed pairs on a grid, no power-ups, and standard two-at-a-time comparison.
- Difficulty presets already exist or will exist elsewhere in the product; this feature records whichever value the player used for the session. **Briefcase** difficulty is the **next-start** parameter; it is not a reactive rebuild trigger for an in-flight round (**FR-014**).
- “Same item” matching uses the existing tile library identity rules from the product data.
- Session restore applies to the same browser and device profile; cross-device sync is out of scope.
- Statistics UI is a separate feature; this feature only stores data in a shape suitable for that feature.
- English copy for any error or status messages related to storage failure.
- Initial Playwright scope is one-tile (or minimal) e2e checks; exhaustive all-tiles e2e is a later iteration, with Vitest bridging coverage until then.

## Out of Scope

- Aggregated statistics dashboards, charts, or history screens (next feature).
- Server-side sync, accounts, or leaderboards.
- Changing the fundamental rules of the memory game (e.g. three-of-a-kind) unless product constitution updates.

