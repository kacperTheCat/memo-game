# Feature Specification: Game tile visual polish and motion

**Feature Branch**: `008-game-tile-polish`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Tiles improvements — smoother organic parallax; remove border colors; rarity-based gradient backgrounds from item color with gold for top tier; glass-like gradient on image side; neutral card backs; squarer tile shape for images; flip animation on tap; **collect-and-merge** when paired (replacing simple fade-out); **wrong pair: shake then flip back** (two-step sequence, not an instant hide)."

## Clarifications

### Session 2026-04-08

- Q: What frame-rate and performance bar should card animations meet, and may implementation use extra dependencies? → A: **At least 60 fps**, **120 fps** as the stretch goal on capable hardware; treat animation performance as a **high priority**; the team **may add or adopt a library** (or other runtime support) if needed to hit the bar.
- Q: Should the revealed tile look like one cohesive card or a rectangle with a separate inner square for the image? → A: **One cohesive element** — rarity gradient, image, and glass treatment share a **single** inner region aligned to the grid cell; **no** nested square “portal” inside a different rectangle frame.
- Q: What should replace fade-out on a correct pair, and how should “batches” and tests read? → A: **Collect animation**: both matched tiles move toward a **collection strip** laid out **below** the main grid (implementation MAY keep this in the **same canvas**). While moving, both tiles **scale down** monotonically until they **merge** into **one** collected entry (one icon/thumbnail per pair). **Batch** means **one matched pair at a time**: the two tiles of that pair animate together as a coordinated unit; successive pairs append new merged entries **left-to-right in match order**. **Tests**: extend or add **Playwright** coverage (primary: `e2e/tile-visual-polish.spec.ts`) for collect path — e.g. post-match, grid cells empty and strip gains an entry within a bounded time; add **Vitest** for any pure layout/timing helpers used by the collect animation (e.g. target positions, scale keyframes, or merge eligibility), consistent with FR-012 performance expectations.
- Q: How should a **wrong pair** animate before tiles return face-down? → A: **Two distinct phases in sequence**: (1) **shake** (or equivalent error motion) while faces remain visible; (2) then a **flip-style animation back to concealed** (mirror of reveal), **not** an instant pop to face-down. Both phases MUST be visible; order is **shake first, flip second**.

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan. *(Stitch: optional for this feature; existing briefcase/game glassmorphism references may inform visual language.)*

### User Story 1 - Fair hidden tiles (Priority: P1)

Players must not be able to guess which item is on a tile before it is revealed. The face-down side of every tile looks the same regardless of the item’s rarity or identity.

**Why this priority**: Memory gameplay depends on hidden information; any visible difference on the back undermines the game.

**Independent Test**: Start a game, observe all tiles face-down only; confirm no per-item cues (color bands, icons, or gradients tied to catalog data).

**Playwright coverage**: `e2e/tile-visual-polish.spec.ts` — scenarios 1–2 (neutral back), plus visual or DOM assertions that back faces do not expose rarity-driven styling.

**Acceptance Scenarios**:

1. **Given** a new deal with mixed rarities, **When** all tiles are face-down, **Then** every tile’s back uses the same neutral treatment with no rarity- or item-specific color.
2. **Given** two different items of different rarity, **When** both are face-down, **Then** their backs are indistinguishable by color or pattern tied to item data.

---

### User Story 2 - Clear reveal, match, and mismatch feedback (Priority: P2)

When the player selects tiles, each flip feels physical; correct pairs **fly to a collection area below the board, shrink, and merge** into one collected item; wrong pairs run a **two-step** response: **shake while face-up**, then **flip back** to face-down (no instant hide).

**Why this priority**: Feedback makes the game understandable and satisfying; it also confirms input was received.

**Independent Test**: Play one correct pair and one wrong pair; observe flip, **collect-and-merge**, and **shake-then-flip-back** on mismatch without relying on other polish (parallax or rarity gradients).

**Playwright coverage**: `e2e/tile-visual-polish.spec.ts` — scenarios 3–6 (flip present, **pair collect/merge into strip**, **mismatch: shake then flip concealed**). Animations may be asserted via stable selectors, `data-testid` on the strip, timing polls, sampled canvas pixels where stable, or screenshots where the pipeline supports it. **Vitest**: unit tests for deterministic collect and **mismatch phase** timing helpers if factored out of the canvas shell.

**Acceptance Scenarios**:

1. **Given** a face-down tile, **When** the player selects it, **Then** the tile performs a visible flip (or 3D rotate) to show the face before match logic completes.
2. **Given** two face-down tiles forming a valid pair, **When** the second is selected, **Then** both tiles animate along paths toward the **collection strip below the grid**, **decreasing in size** during the motion, then resolve into **one** merged collected entry for that pair (no simple opacity-only fade-out as the sole removal cue).
3. **Given** two face-up tiles that are not a pair, **When** the mismatch is resolved, **Then** both tiles first run a **shake** (or equivalent attention motion) with faces still visible, **then** each plays a **flip-style animation back to concealed**; the system MUST NOT skip straight to face-down with no flip-back (instant hide alone is insufficient).
4. **Given** rapid consecutive taps, **When** the game applies its existing input rules, **Then** animations do not leave tiles stuck in a misleading visible state (e.g. half-flipped or wrong face visible).

---

### User Story 3 - Rarity-forward face styling (Priority: P3)

On the revealed side, each tile reads as **one card**: a gradient background driven by the item’s catalog color (gold-forward for top tier), the artwork, and a subtle glass-like treatment all share the **same** inner bounds—no separate inner square framed inside a larger rectangle. Colored decorative borders are removed.

**Why this priority**: Improves collection fantasy and readability without changing core rules.

**Independent Test**: Reveal tiles of different rarities; confirm one unified face per tile (no nested square-in-rectangle), borders gone, and glass reads as part of the same surface as the art.

**Playwright coverage**: `e2e/tile-visual-polish.spec.ts` — scenarios 7–9 (gradient presence by tier, unified-face smoke). Detailed color checks may use snapshots or sampled styles in CI if stable.

**Acceptance Scenarios**:

1. **Given** a revealed non-top-tier item, **When** the face is visible, **Then** the tile background is a gradient derived from that item’s catalog color (not a flat border ring) and prominent colored borders are absent.
2. **Given** a revealed item in the top rarity tier, **When** the face is visible, **Then** the background gradient is gold-forward (distinct from lower tiers).
3. **Given** any revealed tile with art, **When** the face is visible, **Then** the image is laid out within the same rectangular inner bounds as the rarity gradient (contain-style scaling as needed), with a glass-like gradient overlay across that **whole** face—not a second inset frame shape.

---

### User Story 4 - Smoother, more organic parallax (Priority: P4)

Tile parallax (depth motion relative to pointer or device) feels smoother and less mechanical—e.g. through easing, slight delay, stagger, or a revised motion model—so motion feels organic rather than tightly locked 1:1.

**Why this priority**: Polish; does not block fairness or core feedback.

**Independent Test**: Move pointer across the board; compare perceived smoothness and lag/stagger to prior behavior in a manual or recorded session.

**Playwright coverage**: `e2e/tile-visual-polish.spec.ts` — scenario 10 (smoke: parallax still responds to input; optional reduced-motion path if product adds it later).

**Acceptance Scenarios**:

1. **Given** the game board with parallax enabled, **When** the user moves the pointer across the board, **Then** tiles’ motion follows with smooth easing and/or delayed or staggered response so it does not snap harshly with each pixel of movement.

---

### Edge Cases

- **Reduced motion**: If the platform or product later exposes a “reduce motion” preference, animations should respect it; until then, assume default motion-on (document as follow-up if out of scope).
- **Very small viewports**: Unified face layout must not break the grid or overflow the board; tiles remain tappable.
- **Fast matching**: If a second tile is tapped immediately after a match, the board state remains consistent (no duplicate collect animations or stuck tiles).
- **Collect strip overflow**: On large boards, the strip may scroll horizontally or scale chip size; the spec requires readability of order and no overlap with the active grid hit targets (exact overflow UX is implementation detail if bounded).
- **Accessibility**: Shake and flip must not rely solely on color; motion is supplementary to existing game logic.
- **Mismatch timing**: Total wall-clock for **shake + flip-back** MUST stay within the same bounded window as **SC-004**; engine `concealed` truth MAY still follow existing timer if visuals finish first—implementation MUST avoid desync where tiles look interactive while logic says locked (align with **FR-011**).
- **Heavy effects vs frame budget**: If visual treatments (glass, blur, dense gradients) risk missing FR-012 on a baseline device, non-essential visual cost MUST be reduced before lowering the 60 fps floor or removing required motion cues (flip, **collect**, shake).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present every face-down tile with a neutral back that does not encode item id, rarity, or catalog color.
- **FR-002**: The system MUST remove colored border treatments from tile faces that were used for rarity or decoration, replacing emphasis with face background styling as specified.
- **FR-003**: For each revealed tile, the system MUST show a background gradient derived from the item’s existing catalog color, except for items in the top rarity tier, which MUST use a gold-forward gradient.
- **FR-004**: The system MUST map “top rarity tier” consistently to the highest tier in the active tile catalog (see Assumptions for ordering).
- **FR-005**: The revealed tile face MUST present as a **single cohesive region**: rarity gradient, item image, and glass treatment share one common **rectangular** inner area bounded by the grid cell (after consistent padding). The system MUST NOT draw a separate inner square (or other inset shape) that frames only the image while the rest of the face reads as a different “outer” rectangle.
- **FR-006**: That **same** unified face region MUST include a glass-like gradient treatment (subtle highlight/refraction feel) across the surface, including over or beside the artwork as appropriate.
- **FR-007**: The system MUST adjust parallax so motion is smoother and more organic (e.g. easing, inertia, delay, or stagger), avoiding harsh 1:1 snapping where that was the prior issue.
- **FR-008**: On each tile selection that reveals a face, the system MUST play a flip-style animation (3D rotate or equivalent) before the player considers the tile “shown.”
- **FR-009**: When a correct pair is found, the system MUST **not** use a simple fade-out as the only removal cue. It MUST run a **collect** animation: both tiles move toward a **collection strip** region **below** the main grid (same canvas or logically attached region), **monotonically scaling down** during the motion, then **merge** into **one** visual entry representing the collected pair. Matched grid cells MUST become non-interactive empty cells after the collect completes. Successive pairs append new merged entries in **match order** (left-to-right); each pair’s two tiles animate as **one batch** (coordinated pair).
- **FR-009a**: Tiles participating in an active collect animation MUST NOT accept further picks; behavior for other cells MUST stay consistent with the memory engine’s existing resolution rules (no soft-lock).
- **FR-010**: When a wrong pair is found, the system MUST animate both selected tiles in **two sequential visual phases**: (1) **shake** (or equivalent attention motion) while tiles remain **face-up**; (2) **flip-style animation to concealed** (inverse of **FR-008**), so the return to hidden reads as a deliberate second motion. **Instant** transition to face-down **without** a flip-back phase does **not** satisfy this requirement.
- **FR-011**: Animations MUST complete or be cancellable in line with existing game timing rules so the player cannot soft-lock the board.
- **FR-012**: Card-related motion (flip, **match collect/merge**, **mismatch shake and flip-back**, and active parallax) MUST sustain **at least 60 fps** on the project’s baseline QA devices during those effects, with **120 fps** as the target where the display and runtime can deliver it without hurting fairness or usability. Implementation MAY use browser-native motion paths, optimized styling, or a **vetted third-party animation/runtime library** if that is the most reliable way to meet this bar.
- **FR-013**: Automated tests MUST cover collect behavior: **Playwright** asserts end state (e.g. matched cells cleared, strip entry count/order smoke) within a bounded window; **Vitest** covers any extracted pure functions for strip layout, timing constants, or merge completion predicates tied to the feature. Mismatch coverage SHOULD assert or smoke-test the **ordered** shake-then-flip-back sequence where feasible (e.g. phase flags, timing, or stable visual probes), without requiring flaky pixel-perfect screenshots.

### Key Entities

- **Tile (face-down)**: Hidden state; uniform neutral presentation; carries no item-specific visual encoding.
- **Tile (face-up)**: Shows item art; background gradient from catalog color or gold for top tier; glass-like treatment; **unified** inner rectangular viewport (no nested square-within-rectangle framing).
- **Collection strip**: Region below the grid (canvas-internal or canvas-adjacent) holding **one merged visual per matched pair**, ordered by match sequence; entries appear after each pair’s collect animation completes.
- **Item catalog entry**: Existing fields include rarity label and accent color; drives face gradient mapping and top-tier gold exception.
- **Parallax state**: Input-derived offsets per tile or board layer; updated with smoothed or delayed behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a face-down-only review, independent observers (or checklist) cannot sort tiles into rarity groups using back-side appearance alone.
- **SC-002**: In timed observation, every successful reveal includes a visible flip transition before the item is read as “shown.”
- **SC-003**: After a correct pair, both tiles complete a **visible collect**: motion toward the strip, **perceptible shrink** during travel, and **merge into one** strip entry; the pair’s grid cells read as empty within a short, bounded animation window (**under two seconds** end-to-end from match recognition to settled empty cells + new strip entry).
- **SC-004**: After a wrong pair, both tiles complete a **visible shake phase** and then a **visible flip-back to concealed**, in that order, within a short, bounded animation window (**under two seconds** end-to-end for the combined mismatch feedback, aligned with engine resolution timing).
- **SC-005**: Top-tier revealed tiles are identifiable by gold-forward treatment in side-by-side comparison with mid-tier items (same session).
- **SC-006**: Parallax motion during a slow pointer sweep across the board does not exhibit obvious stepwise snapping attributable to raw unsmoothed input mapping (validated by review or screen recording checklist).
- **SC-007**: On baseline QA devices, the card animations named in FR-012 measure **≥60 fps** on average for the duration of each effect; on high-refresh-capable QA setups, the same effects **target 120 fps** where measurement shows the pipeline can sustain it (profiling method recorded in the test plan).

## Assumptions

- **Rarity ordering**: The tile library follows a single global ordering of rarity tiers; the highest tier in that ordering (e.g. “Covert” in the current CS-style set) receives the gold treatment. Items below that use gradients from their catalog `color` value.
- **No new catalog fields required**: Rarity and color already exist per item; mapping is derived from current data.
- **English copy**: Any new user-visible labels remain English per repository constitution.
- **Scope**: Changes apply to in-game tiles on the play surface; other screens (briefcase list, etc.) are unchanged unless they reuse the same tile component and inherit updates intentionally.
- **Performance**: Card animations are budgeted for **≥60 fps** (hard expectation) and **120 fps** where hardware and browser allow (stretch). Meeting the bar takes precedence over maximal visual complexity; optional dependencies are allowed if they improve sustainable frame rate.
- **High vs standard refresh**: 120 fps is only meaningful on displays and runtimes that can present high refresh; 60 fps remains the minimum acceptance bar everywhere else.
