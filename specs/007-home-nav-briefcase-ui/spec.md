# Feature Specification: Home & Navigation Layout Alignment

**Feature Branch**: `007-home-nav-briefcase-ui`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Home page & navigation adjustment — use win game layout as reference for rest of the app. On game view (not win): Return to briefcase arrow (same component), redirect without abandoning; right side similar text button to abandon game (X icon, same as arrow button style); remove other texts and buttons. Briefcase: return to start screen (arrow, same component, different text/redirect); return to game if in progress (right of that); remove other buttons. Home: remove current content; show same stats table as win game; above table Return to game if active and Configure game; buttons same style as return to briefcase from win. Home and Briefcase: background grain texture like game view, black/navy base per Stitch Briefcase."

## Clarifications

### Session 2026-04-08

- Q: Should secondary navigation use ASCII back-arrow / “X” text glyphs or real icons? → A: Use **real icon graphics** from **free / appropriately licensed** sources; **prefer** assets placed under repository **`designs/`** (Stitch exports or added SVG/PNG). If sourcing from an external pack, **record the license** in the repo (e.g. plan or `designs/` README). Controls remain **muted navigation** styling; only the glyph delivery changes from plain text to icons.
- Q: How should **Configure New Game** on home be styled? → A: **Primary** call-to-action — **gold / yellow** (same product primary as **Play Again** on the post-match debrief), **not** the secondary nav family.
- Q: Which grain treatment is the quality baseline for home and briefcase? → A: The **post-match win / debrief** surface on **`/game`** is the **reference bar**. Home and briefcase MUST be **verified in design review** (side-by-side with the debrief) so grain strength and readability **match or intentionally align** with that reference; if home/briefcase read weaker, **adjust** them toward the debrief rather than the reverse.
- Q: May secondary nav use **Google Material Symbols** for arrows, and how should **Return to Game** differ from **back** controls? → A: Yes — use **`material-symbols-outlined`** for these glyphs. **Back** affordances (e.g. **Return to Briefcase**, **Return to Start Screen**, post-match **Return to Briefcase**) MUST use glyph **`arrow_back`** in a span with **`mr-2`**, **`transition-transform`**, and **`group-hover:-translate-x-1`** on the **parent** `group` control. **Return to Game** (home + briefcase hub) MUST use a **forward / right** glyph (**`arrow_forward`** or equivalent in Material Symbols), **`mr-2`**, **`transition-transform`**, and **`group-hover:translate-x-1`** so hover motion nudges **to the right** (opposite of back). **Dismiss** (e.g. **Abandon Game**) SHOULD use Material **`close`** (or equivalent) with the same muted nav family. Document the **Material Symbols** font load (e.g. Google Fonts link) in **plan** / **README** per Google’s terms.

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

**Visual references (Stitch / design export):**

- Post-match debrief pattern (layout, navigation control styling): [inspection_summary_history/screen.png](../../designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/inspection_summary_history/screen.png)
- Briefcase hub look (dark navy/black base + grain): [the_briefcase_main_menu/screen.png](../../designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/screen.png), [code.html](../../designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/code.html)

### User Story 1 - Minimal chrome during active play (Priority: P1)

While a match is **in progress** on the gameplay surface (**not** the post-match win/debrief state), the player sees only two top-aligned navigation affordances: a **Return to Briefcase** control (**Material `arrow_back`** + label, same family as on the post-match screen, **left** hover motion per **Clarifications**) that navigates away **without** ending the resumable session, and an **Abandon Game** control on the opposite side (label + **Material `close`** or equivalent) that **ends** the in-progress session and follows the abandonment outcome below. Icons MUST follow **Clarifications** (Material Symbols or equivalent licensed delivery), not ASCII placeholders. No other instructional text or navigation buttons appear in that chrome region for this state.

**Why this priority**: Prevents accidental data loss, keeps focus on the board, and matches the established debrief navigation language.

**Independent Test**: Start a game, verify only the two controls appear, use Return to Briefcase and confirm the session can still be resumed from the hub; start again and use Abandon, confirm the session is no longer resumable and the user lands on the briefcase hub.

**Playwright coverage**: Path: `e2e/game-view-chrome.spec.ts` (new or consolidated); maps to User Story 1 acceptance scenarios 1–3.

**Acceptance Scenarios**:

1. **Given** an active in-progress match on the gameplay surface, **When** the player views the top chrome, **Then** they see **Return to Briefcase** (**`arrow_back`** + label, left-hover motion) and **Abandon Game** (**`close`** + label) and **no other** buttons or stray copy in that chrome area.
2. **Given** an active in-progress match, **When** the player chooses **Return to Briefcase**, **Then** they reach the briefcase hub and the in-progress session **remains** available to resume until explicitly abandoned or completed.
3. **Given** an active in-progress match, **When** the player chooses **Abandon Game**, **Then** the in-progress session is **terminated** (no longer resumable), and the player is taken to the **briefcase** hub.

---

### User Story 2 - Home hub shows history ledger and primary actions (Priority: P2)

The **home** route presents **no legacy marketing or filler content** from prior versions. Instead, it shows the **same completed-session statistics table** (columns, ordering, empty-state behavior, and English labeling consistent with) the post-match debrief history ledger. Above the table, when a game is **in progress**, the player sees **Return to Game**; they always see **Configure New Game** (or equivalent clear English label) to open match setup. **Return to Game** uses the **secondary navigation** family (muted, **`arrow_forward`** + label, **right** hover motion per **Clarifications**—not the same glyph or direction as **back**). **Configure New Game** uses the **primary gold** call-to-action (same as **Play Again** on the debrief), per **Clarifications**.

**Why this priority**: Centralizes progress visibility and entry points without clutter.

**Independent Test**: Visit home with and without in-progress data; verify table parity with debrief and visibility rules for **Return to Game**.

**Playwright coverage**: Path: `e2e/home-hub-layout.spec.ts` (new or consolidated); maps to User Story 2 acceptance scenarios 1–3.

**Acceptance Scenarios**:

1. **Given** the player opens the home route, **When** they scan the page, **Then** prior non-essential home content is **absent**, and a **history ledger** table matches the post-match debrief table in purpose and column semantics (**Date**, **Difficulty**, **Time**, **Moves**), including **newest-first** ordering when rows exist.
2. **Given** no in-progress session, **When** the player views home, **Then** **Return to Game** is **not** shown and **Configure New Game** **is** available.
3. **Given** an in-progress session, **When** the player views home, **Then** **Return to Game** and **Configure New Game** both appear **above** the table; **Return to Game** matches secondary nav styling with **forward** icon + **right** hover motion, and **Configure New Game** is the **primary gold** CTA.

---

### User Story 3 - Briefcase hub navigation matches the new pattern (Priority: P3)

The briefcase configuration view exposes only: **Return to Start Screen** (**`arrow_back`** + label, distinct from Return to Briefcase destination), and—**only when** a session is **in progress**—**Return to Game** (**`arrow_forward`** + label, **right** hover motion) to the right of it. Icons MUST follow **Clarifications** (Material Symbols). All **other** prior navigation buttons on this view are removed. Destinations: start screen is the **home** hub; return to game resumes the **active** match surface.

**Why this priority**: Aligns secondary hub navigation with the same component vocabulary as gameplay and debrief.

**Independent Test**: Open briefcase with/without in-progress session; verify control set and destinations.

**Playwright coverage**: Path: `e2e/briefcase-view.spec.ts` (extended or replaced scenarios); maps to User Story 3 acceptance scenarios 1–2.

**Acceptance Scenarios**:

1. **Given** the briefcase hub, **When** the player views available actions, **Then** **Return to Start Screen** is present (**`arrow_back`**, left-hover motion) and no legacy extra navigation buttons remain.
2. **Given** an in-progress session, **When** the player views the briefcase hub, **Then** **Return to Game** appears **to the right** of **Return to Start Screen** with **`arrow_forward`** and **right** hover motion, and returns them to the active match; **Given** no in-progress session, **Then** **Return to Game** is **absent**.

---

### User Story 4 - Home and briefcase atmospherics match gameplay grain (Priority: P4)

The **home** and **briefcase** surfaces use a **film-grain / noise texture** and **dark base palette** (black and navy progression). The **post-match debrief** on **`/game`** (win screen) is the **reference bar** for grain strength and cohesion; home and briefcase MUST be **verified** side-by-side with that surface so they **match or align** with it (see **Clarifications**). The Stitch **Briefcase** export remains a layout/color reference; grain parity is judged against the **live debrief** treatment.

**Why this priority**: Visual continuity across routes reinforces one product; secondary to functional navigation.

**Independent Test**: Compare home, briefcase, and gameplay backgrounds side by side for grain presence and readable contrast for text and controls.

**Playwright coverage**: Path: `e2e/home-hub-layout.spec.ts` and `e2e/briefcase-view.spec.ts`; maps to User Story 4 acceptance scenario 1 (contrast/readability smoke assertions where feasible, plus manual design review note).

**Acceptance Scenarios**:

1. **Given** the player navigates among **home**, **briefcase**, **active gameplay**, and the **post-match debrief** on **`/game`**, **When** they observe backgrounds, **Then** **home** and **briefcase** show **visible grain** over a **dark navy/black** base, read **no weaker** than the debrief grain in a design review, and foreground text and controls remain **legible** without low-contrast gray-on-gray pairings.

---

### Edge Cases

- **Post-match debrief on `/game`**: The minimal two-control chrome in User Story 1 applies to **active play** only; the debrief continues to use its own controls (e.g. Play Again, Return to Briefcase) and MUST NOT be forced into the abandon/return briefcase pair described for in-progress play.
- **No history rows**: Home table shows the same **empty-state** behavior and copy tone as the debrief ledger (English, non-breaking layout).
- **Abandon immediately after resume**: Abandon still clears in-progress state even if the player had just returned from briefcase/home.
- **Direct URL entry**: Visiting home or briefcase directly MUST still show the correct control visibility rules (in-progress vs not).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: During **in-progress** gameplay (excluding post-match debrief), the product MUST show **only** **Return to Briefcase** and **Abandon Game** in the designated top chrome; all **other** prior texts and buttons in that chrome region MUST be removed.
- **FR-002**: **Return to Briefcase** from in-progress play MUST navigate to the briefcase hub and MUST **not** discard the resumable in-progress session.
- **FR-003**: **Abandon Game** MUST end the resumable in-progress session and MUST navigate the player to the **briefcase** hub.
- **FR-004**: **Return to Briefcase** and **Abandon Game** MUST share one **consistent** “muted navigation” visual family with the post-match **Return to Briefcase** control, with **Abandon** distinguished by a **close** glyph (**Material `close`** or equivalent), not **`arrow_back`**. Secondary nav icons MUST use **Google Material Symbols Outlined** (`material-symbols-outlined`) unless an exception is documented: **`arrow_back`** + **`mr-2`** + **`transition-transform`** + parent **`group`** with **`group-hover:-translate-x-1`** for **back**; **`close`** for dismiss. ASCII-only placeholders MUST NOT ship as the final icon treatment. Other art MAY remain inline SVG where Material does not apply; **font load** MUST comply with **Google Fonts / Material Symbols** terms and be documented.
- **FR-005**: The **home** route MUST remove prior non-essential content and MUST present the **completed-session history table** with the **same semantic columns and ordering rules** as the post-match debrief history ledger.
- **FR-006**: The **home** route MUST show **Configure New Game** above the table at all times (when the product offers configuration), and MUST show **Return to Game** above the table **if and only if** a session is **in progress**.
- **FR-007**: On home, **Return to Game** MUST use the **secondary navigation** styling family (muted, icon + label) with **Material `arrow_forward`** (or equivalent forward glyph), **`mr-2`**, **`transition-transform`**, and parent **`group-hover:translate-x-1`** (motion **to the right**). **Configure New Game** MUST use the **primary gold** call-to-action (same as debrief **Play Again** / product primary accent).
- **FR-008**: The **briefcase** hub MUST show **Return to Start Screen** (**`arrow_back`** + label per **FR-004**) targeting the **home** route, and MUST show **Return to Game** (**`arrow_forward`**, **right** hover motion per **FR-007**) to its **right** only when a session is **in progress**; all **other** navigation buttons previously on this view MUST be removed.
- **FR-009**: **Home** and **briefcase** backgrounds MUST include a **grain texture** and a **dark black/navy** base. **Post-match debrief** (`/game` win state) grain is the **reference bar**: implementation MUST be **verified** (design review) so home/briefcase grain **matches or aligns** with that debrief—not a visibly weaker treatment. Stitch briefcase export informs layout/hue; **parity** is judged against the **debrief** screen.
- **FR-010**: All new or changed user-visible strings MUST be **English** and MUST meet **WCAG-minded contrast** for body and control labels on the new backgrounds.

### Key Entities

- **In-progress session**: A match that can be resumed from hub routes; presence drives conditional **Return to Game** affordances.
- **Completed session record**: Rows in the shared history ledger (date, difficulty, elapsed time, moves).
- **Navigation control family**: Shared secondary navigation (**Material Symbols** + label, **`group`** hover motion): **back** = **`arrow_back`** + **`group-hover:-translate-x-1`**; **resume forward** = **`arrow_forward`** + **`group-hover:translate-x-1`**; **dismiss** = **`close`**. Reused across debrief, gameplay chrome, home (**Return to Game**), and briefcase. **Primary CTA** on home (**Configure New Game**) is excluded from this family.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In user acceptance testing, **100%** of scripted flows confirm that **Return to Briefcase** during play preserves resumable state and **Abandon Game** removes it, with **no** third hidden exit in the same chrome region.
- **SC-002**: On the home route, **95%** of testers locate **Configure New Game** and the history table within **10 seconds** without guidance (hallway test sample ≥ 5).
- **SC-003**: Acceptance verification covers **home**, **briefcase**, and **in-progress gameplay** for both **presence** and **absence** of **Return to Game** across **at least six** distinct situations (e.g. hub × in-progress yes/no) with **no** conflicting outcomes.
- **SC-004**: Design review rates **home** and **briefcase** **at least** “acceptable match” on a 3-point scale (miss / acceptable / excellent) for **navigation cohesion** (including **real icons** per **FR-004**) and for **grain parity with the post-match debrief** (not weaker than debrief).

## Assumptions

- **Abandon destination**: After abandonment, the player lands on **`/briefcase`** (briefcase hub), consistent with treating the briefcase as the configuration and session-management hub.
- **“Same stats table”**: Means **equivalent data and column semantics** and **ordering** as the post-match debrief ledger, not necessarily pixel-identical sub-layout if the home viewport requires reflow, provided readability and column labels match.
- **Configure New Game**: Navigates to the **briefcase** setup experience (same as today’s “configure match parameters” intent).
- **Return to Start Screen**: Navigates to the **home** route.
- **Win debrief unchanged**: Existing post-match debrief behavior (Play Again, history, Return to Briefcase) remains; this feature only adds/changes **active-play** chrome and **home/briefcase** shells as described.
