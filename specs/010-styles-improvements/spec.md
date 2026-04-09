# Feature Specification: Styles improvements (ambient visuals)

**Feature Branch**: `010-styles-improvements`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Styles improvements — cursor spotlight on home, briefcase, and win views (below cards for glass UI); Pretext-style letter animation for Briefcase Operation Complete on enter; game card gradient follows cursor smoothly; briefcase yellow ambience moves and morphs like smoke (same depth as spotlight); subtle animated grain on home and briefcase."

## Clarifications

### Session 2026-04-09

- Q: How should the pointer/touch spotlight behave regarding stability and motion character? → A: It MUST NOT stay rigidly locked to the input; it MUST feel like a **soft cloud mass chasing** the pointer or touch—**lagged, smoothed pursuit** with **organic motion** (not a stable 1:1 overlay on the cursor).
- Q: How should the spotlight behave when the mouse stops moving? → A: The highlight MUST **fade out** (reduce to imperceptible or off) after **pointer idle**—i.e. when the user is **not moving** the mouse for a **short, product-defined period** (exact threshold in plan).
- Q: How should the spotlight behave on touch screens? → A: It MUST **only appear while the user is actively touching** the screen (finger down / contact active) and MUST **disappear or fully fade out** when the user **lifts the finger** or touch **ends**—not a persistent “last position” glow after touch ends.
- Q: Should the cloud spotlight’s silhouette respond to motion like wind-shaped clouds? → A: **Yes** — while the pointer **moves** (mouse path), the glow MAY **elongate or bias** along the **direction of smoothed motion** (“wind”), **strength tied to speed** and **fading with the same visibility envelope** as the rest of the spotlight; under **prefers-reduced-motion**, directional stretch MUST be **off** (static silhouette).

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

### User Story 1 - Cursor spotlight behind content (Priority: P1)

On Home, Briefcase, and Win Game views, a soft light **chases** **mouse pointer** input from **behind**—with **lag and soft, cloud-like motion**—so it is **not** a rigid, pixel-stable highlight. When the pointer **stops moving**, the light **fades out** after a short idle. On **touch**, the light **only shows while contact is active** and **goes away** when the finger lifts. The light sits at the **bottom** of the visual stack so cards, panels, and other UI sit clearly above it, supporting a glass-like appearance.

**Why this priority**: Defines depth and readability for the rest of the polish; wrong stacking breaks the intended look.

**Independent Test**: Open each view, move the pointer quickly then slowly; confirm the glow **follows with delay and organic drift** (cloud-chasing feel), **fades after idle**, and never paints over primary interactive content. On a touch device (or emulation), confirm the glow **appears only during touch** and **absent after touchend**.

**Playwright coverage**: Path: `e2e/styles-spotlight-depth.spec.ts`; maps to scenarios 1–6 below (touch/idle cases as plan allows; scenario 6 manual or follow-up automation as needed).

**Acceptance Scenarios**:

1. **Given** the Home view is visible, **When** the user moves the pointer across the viewport, **Then** a soft light **chases** the input with **noticeable lag or waft** (not rigidly pinned), and primary foreground elements (e.g. navigation, cards) remain visually above that light.
2. **Given** the Briefcase view is visible, **When** the user moves the pointer, **Then** the same **cloud-chasing** behavior and depth rule hold for briefcase panels and controls.
3. **Given** the Win Game view is visible, **When** the user moves the pointer, **Then** the spotlight remains beneath win-screen content layers and **does not** track the cursor as a fixed, stable attachment.
4. **Given** any of these views with **mouse pointer** input, **When** the user **stops moving** the pointer for a **short idle** (threshold per plan), **Then** the spotlight **fades out** to **not distract** (imperceptible or fully off per plan).
5. **Given** a **touch** surface, **When** the user **touches** the view, **Then** the spotlight **may appear** and chase the contact point; **When** the user **releases** touch, **Then** the spotlight **disappears or fades out** promptly—**no** persistent glow at the last touch point by default.
6. **Given** mouse input and **motion** across the view, **When** the user moves at moderate speed, **Then** the spotlight reads as a **soft mass** that may **stretch or lean along the travel direction** (wind-like), without breaking **FR-002** depth or causing harsh strobing (**FR-001c**).

---

### User Story 2 - Game card gradient follows the cursor (Priority: P1)

On the game board, each face-up (or otherwise eligible) card’s gradient or highlight responds to pointer position so that **lighter tones cluster nearer the cursor** and changes animate **smoothly** without harsh jumps when the pointer moves.

**Why this priority**: Core in-game affordance; ties directly to the “memo” tile experience.

**Independent Test**: Start a game, reveal tiles, move the pointer across cards at moderate speed; gradient focal point tracks with easing, not snap.

**Playwright coverage**: Path: `e2e/styles-game-card-gradient.spec.ts`; maps to scenarios 1–2 below (assert presence/CSS custom properties or computed styles as agreed in plan).

**Acceptance Scenarios**:

1. **Given** at least one interactive game card is visible, **When** the pointer moves relative to that card, **Then** the card’s lighter gradient region shifts toward the pointer side in a visibly smooth transition.
2. **Given** the pointer stops on a card, **Then** the gradient settles without ongoing oscillation or flicker beyond a brief settle period.

---

### User Story 3 - Briefcase yellow ambience motion (Priority: P2)

The existing yellow “lighting” / ambience element on Briefcase moves around the view on **non-linear, varied paths**, and its silhouette **changes over time** (smoke or soft cloud-like distortion), at the **same stacking depth** as the cursor spotlight (both behind foreground UI).

**Why this priority**: Atmospheric; depends on US1’s z-order contract so it must align with spotlight layering.

**Independent Test**: Open Briefcase idle; observe continuous motion and shape change without overlapping cards incorrectly.

**Playwright coverage**: Path: `e2e/styles-briefcase-ambience.spec.ts`; maps to scenarios 1–2 below.

**Acceptance Scenarios**:

1. **Given** the Briefcase view is visible, **When** the user watches without interacting for several seconds, **Then** the yellow ambience changes position in a non-repeating-feeling way (not a single fixed loop only on a short period).
2. **Given** foreground briefcase UI is present, **Then** the yellow ambience and cursor spotlight both remain visually beneath that UI.

---

### User Story 4 - Operation Complete letter entrance (Priority: P2)

When the Briefcase screen shows **Operation Complete** (or equivalent completion heading), the text **animates in on first entry** with a **per-character or per-glyph stagger** so letters appear in a deliberate sequence rather than all at once.

**Why this priority**: Celebrates completion; scoped to one headline.

**Independent Test**: Trigger the completion state, navigate to the view; observe staggered reveal once per entry (not on every tiny re-render if avoidable).

**Playwright coverage**: Path: `e2e/styles-operation-complete-text.spec.ts`; maps to scenarios 1–2 below.

**Acceptance Scenarios**:

1. **Given** the user reaches Operation Complete on Briefcase, **When** the completion heading first becomes visible, **Then** characters finish appearing within **2 seconds** of visibility (stagger may start immediately).
2. **Given** the user leaves and re-enters the completion presentation, **Then** the entrance animation may replay according to product rules (default: replay on each full entry to the completion view).

---

### User Story 5 - Subtle grain motion on Home and Briefcase (Priority: P3)

The film-grain (or noise) texture used on Home and Briefcase exhibits **slow, small-scale movement** so the texture feels alive without stealing attention from content.

**Why this priority**: Ambient polish after core depth and gameplay visuals.

**Independent Test**: Static screenshot comparison over a few seconds shows grain phase/offset change subtly.

**Playwright coverage**: Path: `e2e/styles-grain-motion.spec.ts`; maps to scenario 1 below (optional visual regression or attribute assertion per plan).

**Acceptance Scenarios**:

1. **Given** Home or Briefcase is visible, **When** the user observes the background for **3+ seconds**, **Then** the grain pattern shows continuous low-amplitude motion (not a completely static bitmap).

---

### Edge Cases

- **Touch vs mouse (spotlight)**: On **touch**, the ambient spotlight follows **FR-001b** (visible **only during active contact**, off after release). On **mouse**, it follows **FR-001a** (chase while moving, **fade after idle**). This replaces any earlier “last touch drives chasing spotlight after lift” intent for the **ambient spotlight** layer; **game board** card gradients MAY still use other touch fallbacks per FR-003.
- **Reduced motion**: System or user **prefers-reduced-motion** — animations (grain, smoke path, letter stagger, gradient easing, **spotlight chase**) MUST reduce to a static or minimally animated state per WCAG-oriented expectations.
- **Rapid pointer movement**: Gradient and spotlight updates MUST avoid visible strobing; **spotlight** MAY **lag further** or **blend motion** so the cloud-like mass still reads as chasing input rather than flickering in lockstep.
- **Resize / orientation change**: Ambience paths and grain SHOULD re-layout without permanent clipping or wrong z-order.
- **Wide document / horizontal overflow**: When `document` width exceeds the **visual viewport** (e.g. wide tables on Home), spotlight **centroid and test hooks** MUST still follow **viewport** pointer coordinates (**clientX** / **clientY**), not a percentage of an overflowing layout box.
- **Low-end devices**: Effects SHOULD remain optional to tone down in plan if performance budgets are exceeded (document in plan, not spec).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On **Home**, **Briefcase**, and **Win Game** views, the product MUST render an ambient soft light governed by **FR-001a** (mouse) and **FR-001b** (touch) below.
- **FR-001a** (**mouse / pointer**): While the pointer **moves**, the **centroid or brightest region** MUST **pursue** the cursor within the view using **smoothed, lagged, cloud-like motion**—**not** rigidly locked. When the pointer is **idle** (no movement for a **short, plan-defined** period), the spotlight MUST **fade out** smoothly toward **off** or **imperceptible** (no strong persistent glow at rest).
- **FR-001b** (**touch**): The spotlight MUST be **visible only during active touch contact** (finger or stylus **down** on the surface). When touch **ends** (`touchend` / contact lifted), the spotlight MUST **disappear or fade out promptly**—MUST **not** remain as a stable highlight at the last touch location.
- **FR-001c** (**wind-shaped cloud on mouse motion**): On the **mouse path**, the spotlight silhouette MAY **elongate or skew along smoothed motion direction** with **strength proportional to perceived speed**, scaled by the same **visibility envelope** as opacity (off when faded). MUST **not** introduce harsh flicker; MUST be **disabled** when **prefers-reduced-motion** is active (no directional stretch).
- **FR-002**: That soft light MUST sit **below** (lower z-order than) primary content such as cards, panels, and key typography so glass-style surfaces read correctly.
- **FR-003**: On the **game board**, eligible cards MUST expose a **cursor-reactive** lightness gradient where **brighter values bias toward the pointer** relative to each card’s bounds.
- **FR-004**: Transitions of card gradients MUST be **smooth** (no single-frame jumps for typical pointer speeds; exact implementation in plan).
- **FR-005**: On **Briefcase**, the yellow ambience element MUST **move** around the viewport on **varied** paths and MUST **change shape** over time in a soft, cloud- or smoke-like manner.
- **FR-006**: The yellow ambience MUST share the **same stacking relationship** to foreground UI as the cursor spotlight (both behind primary content).
- **FR-007**: The **Operation Complete** heading on Briefcase MUST play a **staggered character (or glyph) entrance animation** when the completion view is entered.
- **FR-008**: **Home** and **Briefcase** background grain MUST show **continuous subtle positional or phase motion** (not a permanently static grain tile).
- **FR-009**: When **prefers-reduced-motion** is active, all new motion in FR-001a, FR-001b, **FR-001c**, FR-003, FR-005, FR-007, and FR-008 MUST respect reduced-motion behavior (static or minimal motion; spotlight MAY stay off or static dim; **no wind stretch**).
- **FR-010**: All user-visible strings introduced or touched by this feature MUST remain **English**.

### Out of scope

- Win Game view grain motion (only Home and Briefcase unless later product asks).
- New persistence, new routes, or gameplay rule changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual review on Home, Briefcase, and Win Game, **100%** of sampled primary UI elements (cards, main panels) remain **visually above** the cursor spotlight in static and moving-pointer checks.
- **SC-006**: During a **quick pointer sweep** on each of those views, reviewers confirm the spotlight **lags or wafts** relative to the cursor (binary checklist: **not** a rigidly stable lock to the pointer).
- **SC-009**: During a **sustained diagonal or horizontal drag** at moderate speed (mouse), reviewers confirm the glow **reads elongated or biased along the direction of travel** (wind-like), then **relaxes** when movement slows or stops—without breaking **FR-002** (binary checklist).
- **SC-007**: After **mouse idle** (plan-defined threshold) on each view, reviewers confirm the spotlight **fades out** (not remaining at full strength at rest).
- **SC-008**: On **touch**, reviewers confirm the spotlight is **absent with no touch** and **present only during contact** (or equivalent plan-verified signal); after **finger lift**, it **does not** persist as a fixed blob at the last point.
- **SC-002**: Operation Complete stagger completes within **2 seconds** of the heading becoming visible (FR-007).
- **SC-003**: For a **5-second** observation on Briefcase, reviewers report the yellow ambience **both** changes position **and** silhouette (shape) at least once (binary checklist).
- **SC-004**: For a **3-second** observation on Home and Briefcase, reviewers confirm grain **is not static** (binary checklist).
- **SC-005**: With **prefers-reduced-motion** enabled, no story violates **FR-009** in spot checks (Playwright or manual).

## Assumptions

- **Mouse**: primary; spotlight **chases** while moving and **fades on idle** (**FR-001a**). **Touch**: spotlight **only while touching**; **gone after release** (**FR-001b**)—not the same persistence model as mouse.
- Stakeholder referenced the **Pretext** interaction model for letter animation (external reference: `https://github.com/chenglou/pretext`); the specification requires the **observable staggered reveal**, not a mandated library, unless planning locks an implementation.
- “Game card” means the in-play memo tiles on the game board; face-down behavior follows existing product rules unless planning extends eligibility.
- No new **localStorage** or API contracts; purely presentational.
- Performance: maintain **60 fps perceived** interactions on a mid-tier laptop target where possible; heavy fallbacks are acceptable only if documented in the plan.
