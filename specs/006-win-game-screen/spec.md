# Feature Specification: Post-Match Win Screen

**Feature Branch**: `006-win-game-screen`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Win game screen. Based on Inspection (Summary & History) in stitch project create a new view that will be seen after game completed. Add stats: time, moves, button to play again (generates random layout from previously selected difficulty). Add history (stats table) with Date, Difficulty, Time and moves. Add nice gold background with grains texture. Stats elements should be liquid glass. References: designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/inspection_summary_history/screen.png and code.html."

## Clarifications

### Session 2026-04-08

- Q: Should the post-match debrief use its own route (e.g. `/win`)? → A: **No.** It stays on the **same route as gameplay (`/game`)**: after a win, the UI **transitions** from the board to the debrief **without** changing the URL. There is **no** standalone win URL a user can open manually to reach the debrief.
- Q: How should Playwright validate the win flow? → A: Use **deterministic randomness via a fixed seed** for the deal/layout so pair positions are known; tests MUST cover the **full workflow** from an active **`/game`** session through **win** into the debrief (not a shortcut that only mounts the debrief in isolation).
- Q: If the player refreshes the tab while the post-match debrief is showing on **`/game`**, what should happen? → A: Load **`/game`** as a **new active game** at the **same difficulty** as the completed session, with a **new randomized layout**, **as if** the player had pressed **Play Again**; the debrief MUST **not** reappear after reload. The completed win MUST remain in **history** as already recorded.
- Q: Should navigating to the briefcase clear win-only UI state? → A: **Yes.** Any navigation that lands the player on **`/briefcase`** MUST **clear** the **win debrief presentation state** so the app never resumes an **orphan debrief** on **`/game`** without a **new** win in the current flow.

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

**E2E strategy (clarified):** Primary Playwright proof for this feature is **`e2e/win-game-screen.spec.ts`** running a **seeded** game on **`/game`** through **win**, then asserting debrief content and actions. Seeding makes the layout predictable so the test can flip known matching pairs without flakiness.

**Visual reference (Stitch / design export):** [screen.png](../../designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/inspection_summary_history/screen.png), [code.html](../../designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/inspection_summary_history/code.html) — layout, copy tone ("Post-Match Debrief", "Operation Complete", "History Ledger", "Local Data"), two-column summary + table, difficulty chips, and primary gold call-to-action.

### User Story 1 - See completion summary and play again (Priority: P1)

After winning a game on **`/game`**, the **same route** transitions from the canvas board to a **post-match debrief view** (no URL change) that confirms success and shows how long the round took and how many moves were used. The player can start another round at the **same difficulty** with a **new random layout** using one clear primary action.

**Why this priority**: This is the core closure loop after success; without it, players cannot confidently finish a session or restart fairly.

**Independent Test**: Complete a game to the win state and verify the summary values match the finished session and that Play Again starts a new match at the same difficulty with a different arrangement.

**Playwright coverage**: Path: `e2e/win-game-screen.spec.ts`; **full `/game` → win → debrief** flow using a **fixed seed**; maps to User Story 1 acceptance scenarios 1–4 (including **reload-on-debrief** where feasible).

**Acceptance Scenarios**:

1. **Given** a game that has just been won on **`/game`**, **When** the win flow completes, **Then** the URL remains **`/game`** and the player sees the post-match debrief (not the in-progress board) with headings consistent with the debrief pattern and the just-finished **elapsed time** and **move count** visible.
2. **Given** the post-match debrief on **`/game`**, **When** the player uses the primary **Play Again** control, **Then** the view returns to the board, a new game starts at the **same difficulty** as the completed session, and the tile layout is **newly randomized** (not identical to the prior winning board).
3. **Given** the post-match debrief, **When** the player reviews the stat area, **Then** the time and move values are readable at a glance and presented in **liquid-glass** style panels (translucent, frosted panels with depth), matching the referenced inspection design intent.
4. **Given** the post-match debrief on **`/game`**, **When** the player performs a **full page reload**, **Then** the debrief is **not** shown and **`/game`** presents a **new** active game at the **same difficulty** with a **new** layout (**Play Again**–equivalent), while the just-won session **remains** in **history**.

---

### User Story 2 - Review local history ledger (Priority: P2)

On the same screen, the player sees a **history** table of past completed sessions stored on the device, with columns **Date**, **Difficulty**, **Time**, and **Moves**, so they can compare runs over time.

**Why this priority**: Reinforces progression and replay value; secondary to confirming the current win.

**Independent Test**: After multiple wins at different difficulties, reach the post-match debrief after each win and verify rows appear with correct columns, ordering, and difficulty labeling.

**Playwright coverage**: Path: `e2e/win-game-screen.spec.ts`; same **seeded full-flow** test (or follow-on scenarios in that file) maps to User Story 2 acceptance scenarios 1–2.

**Acceptance Scenarios**:

1. **Given** at least one prior completed session exists locally, **When** the player views the post-match debrief on **`/game`**, **Then** a **History Ledger** (or equivalent title) section lists rows with **Date** (calendar date, `YYYY-MM-DD`), **Difficulty** (Easy / Medium / Hard with distinct visual treatment per level), **Time** (`MM:SS`), and **Moves** (whole number).
2. **Given** multiple completed sessions, **When** the player opens the ledger on the debrief, **Then** rows appear in **newest-first** order (most recent at the top).

---

### User Story 3 - Return to briefcase hub (Priority: P3)

From the post-match debrief on **`/game`**, the player can leave the debrief and return to the briefcase (or equivalent hub). Using **Return to Briefcase** MUST **not** start **Play Again** in the same step; it MUST **clear win debrief state** so **`/game`** does not later show an **orphan debrief** without a **new** win.

**Why this priority**: Supports navigation and thematic framing; does not block play-again or history.

**Independent Test**: From the post-match debrief on **`/game`**, use the back-to-briefcase affordance and confirm arrival at the hub route/view.

**Playwright coverage**: Path: `e2e/win-game-screen.spec.ts`; maps to User Story 3 acceptance scenarios 1–2 (Return to Briefcase + **briefcase → `/game`** debrief reset).

**Acceptance Scenarios**:

1. **Given** the post-match debrief on **`/game`**, **When** the player activates the **Return to Briefcase** (or equivalent) navigation control, **Then** they are taken to the briefcase experience, **Play Again** is **not** invoked by that control alone, and **win debrief presentation state** is cleared so a later visit to **`/game`** does **not** show the debrief without a **fresh** win.
2. **Given** the post-match debrief on **`/game`**, **When** the player navigates to **`/briefcase`** (any route entry that shows the briefcase hub) and then opens **`/game`** again, **Then** the post-match debrief is **not** shown until they complete a **new** win.

---

### Edge Cases

- **No prior history**: The table area shows a clear **empty state** in English (e.g. no rows yet) without breaking layout.
- **Narrow viewports**: The history table remains usable (horizontal scroll or stacked presentation) so all four columns stay accessible.
- **Single session**: Only one row appears; current run is represented accurately in the summary and appears in history once the win is recorded.
- **Interrupted games**: Quitting or losing does not show this win debrief; it applies only to successful completion.
- **No standalone win URL**: The debrief is **not** a separate bookmarkable route; users cannot navigate directly to “win only” without completing a win from **`/game`** in that session flow.
- **Refresh / reload on `/game` while debrief is showing**: After a full reload, the player MUST **not** see the post-match debrief; **`/game`** MUST show a **new active game** at the **same difficulty** with a **new layout**, **equivalent to Play Again**. The won session MUST **remain** in the **history ledger** as already persisted.
- **Navigation to briefcase clears debrief mode**: Reaching **`/briefcase`** (including via **Return to Briefcase** from the debrief) MUST **clear win debrief UI state** so returning to **`/game`** never restores the debrief **without** completing a **new** win.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present a **post-match (win) debrief** immediately after a successful game completion **on the same route as play (`/game`)**, by **replacing** the board UI with the debrief UI **without** changing the URL. There MUST be **no** separate public route whose sole purpose is the win debrief.
- **FR-002**: The screen MUST display **elapsed time** and **total moves** for the session that was just completed, labeled in English.
- **FR-003**: The screen MUST provide a **Play Again** action that starts a **new game** at the **same difficulty** as the completed session with a **new random** tile arrangement.
- **FR-004**: The screen MUST include a **history** section titled in line with the design reference (e.g. **History Ledger**) and a subtle **Local Data** (or equivalent) indicator that sets expectations for on-device storage.
- **FR-005**: The history section MUST render a table (or semantically equivalent structure) with columns **Date**, **Difficulty**, **Time**, and **Moves**, using English column headers.
- **FR-006**: **Date** MUST use `YYYY-MM-DD`. **Time** MUST use `MM:SS`. **Moves** MUST be a non-negative integer. **Difficulty** MUST show the human-readable level and MUST be visually distinguishable per level (e.g. Easy / Medium / Hard treatments aligned with the reference design).
- **FR-007**: History MUST be populated from the same **local completed-session** source used elsewhere in the product; the newest session appears first.
- **FR-008**: When no history exists, the UI MUST show an English **empty state** without errors.
- **FR-009**: The screen MUST include **Return to Briefcase** (or the product’s equivalent hub label) navigation consistent with existing information architecture.
- **FR-010**: The overall page MUST use a **dark gold** ambient background with a **subtle grain** texture across the viewport for depth, consistent with the referenced Stitch inspection screen.
- **FR-011**: Stat blocks (time and moves) MUST use a **liquid-glass** visual treatment (translucent frosted panels with gentle edge/light cues), consistent with the referenced inspection design; the history container SHOULD use the same glass family for cohesion.
- **FR-012**: **Playwright** coverage for this feature MUST exercise a **full user journey** starting from an active **`/game`** session, using **deterministic randomness** (e.g. a fixed **seed** for the deal) so tile positions are reproducible, through **win** into the debrief, then validating summary stats and at least one follow-up action (**Play Again** or **Return to Briefcase**) as appropriate per scenario. Tests MUST NOT rely on navigating to an isolated win-only URL that normal users cannot reach.
- **FR-013**: A **full page reload** on **`/game`** while the post-match debrief is visible MUST result in a **new game** at the **same difficulty** as the session that produced the debrief, with a **new randomized** tile layout, **as if** **Play Again** had been activated; the debrief MUST **not** be shown again after reload. Previously recorded **completed-session** history MUST be unchanged by the reload (the won run remains in the ledger).
- **FR-014**: Navigating to **`/briefcase`** MUST **clear** any active **win debrief presentation state** so the product never shows the post-match debrief on **`/game`** again until the player **wins** a **new** round in that flow.

### Key Entities

- **Just-finished session summary**: Elapsed time, move count, difficulty of the completed game (drives Play Again).
- **History row (completed session record)**: Completion date, difficulty, elapsed time, move count; ordered newest first for display.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **100%** of **seeded** end-to-end runs from **`/game`** through win land on the post-match debrief (still **`/game`**) with **time** and **moves** matching the finished session’s recorded values.
- **SC-002**: **100%** of **Play Again** actions in test scenarios start a new game at the **same difficulty** and with a **different** board arrangement than the prior completed game (verified over repeated trials).
- **SC-003**: On a typical desktop viewport, users can read **both** stat values and the **Play Again** control **without vertical scrolling** (layout matches the two-column reference intent).
- **SC-004**: For any stored history of **N** rows (**N** from 0 to at least 10 in tests), the table always shows exactly **four** labeled columns and **newest-first** order with **zero** rendering errors.
- **SC-005**: In qualitative review against the Stitch reference, stakeholders agree the screen reads as the same **post-match debrief** pattern: gold ambient + grain, glass stat panels, ledger table, and primary gold replay action.
- **SC-006**: **100%** of scripted checks for **reload-on-debrief** and **briefcase navigation from debrief** confirm the debrief does **not** persist incorrectly: after reload, **`/game`** shows the **board** in a **new** match at the prior difficulty; after **`/briefcase`**, a subsequent **`/game`** visit does **not** show the debrief until a **new** win.

## Assumptions

- **English-only** UI copy for this feature, per repository constitution.
- **Local persistence** for completed sessions already exists or will be extended as part of integrated delivery; this spec does not introduce cloud sync.
- **Win detection** and session metrics (time, moves, difficulty) are produced by existing game logic; this feature consumes them for display and navigation.
- **Routing**: Post-match debrief shares **`/game`** with the board; **no** dedicated win route; journey after win is an in-route UI transition.
- **Out of scope**: Server-side leaderboards, account sync, editing or deleting history rows, and non-win end states (loss / abandon).
