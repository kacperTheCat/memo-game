# Feature Specification: Stitch-Referenced Theme and The Briefcase View

**Feature Branch**: `002-stitch-theme-briefcase`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "Setup design theme based on Stitch MCP. Ignore Stitch screen flows and interaction logic; product requirements changed since those designs were produced. Use only the overall theme plus **The Briefcase** and **Inspection** Stitch screens as visual references for how the product should look. Final deliverable for this feature: **The Briefcase** view."

## Clarifications

*All entries below are dated **2026-04-07**; numbered parts group separate clarification rounds the same day.*

### Session 2026-04-07 — 1

- Q: How should the memory game surface relate to Vue UI? → A: **Canvas** hosts the **actual game tiles**; **all other UI** (including The Briefcase) is built with **regular Vue components** as **HTML-rendered DOM** (not canvas UI for chrome).
- Q: Must this feature include in-app navigation between home and The Briefcase? → A: **Yes**—**discoverable in-app navigation in both directions** (home ↔ Briefcase), with **English** labels on those controls. (Canvas lives on the **game** route, not **home**—see later clarification.)
- Q: Where is the canvas hosted relative to home? → A: **Home** is the **main entry** (DOM only, **no** canvas). The **HTML canvas** for tiles lives on a **separate game route** (e.g. **`/game`**), inside a dedicated **`GameCanvasShell`** (or equivalent) component; the user reaches it from **home** via **discoverable in-app** controls (**English** labels).
- Q: Which Stitch screen governs **colors**, and what Briefcase chrome is in scope? → A: **The Briefcase (Main Menu)** (concretely **`designs/.../the_briefcase_main_menu/`**—see **Session 2026-04-07 — 2**) governs **palette and colored surfaces**. The shipped Briefcase view MUST include **Main Menu–style** elements: **difficulty selection**, **glass (frosted) effects** on appropriate regions, an **Unlock showcase** primary action, a **seed** input (label and field as on the reference), and other controls that appear on that reference screen **unless** they conflict with **current** product rules (**FR-003**). **English** copy follows product, not legacy export strings.
- Q: Is a **seed** input required on The Briefcase? → A: **Yes**—a **seed** input (**English** label, **visible** and **editable**) MUST appear as on **The Briefcase (Main Menu)**; **client-side** value or **stub** until the game loop reads it is acceptable (**FR-010**).
- Q: Must The Briefcase reproduce the **Briefcase (Main Menu)** **background** treatment (the distinctive **backdrop** effect behind chrome, not only **glass** panels)? → A: **Yes**—the **page-level / backdrop** MUST reflect the reference’s **decorative background** (e.g. layered color, gradient, texture, and/or **subtle** motion as shown in Stitch). Implement with **HTML/CSS** on the Briefcase route (**not** canvas UI; **FR-007**). **Respect** `prefers-reduced-motion` (or equivalent product setting when it exists) with a **static or simplified** fallback that preserves **readability** and **palette** intent (**FR-010(e)**).

### Session 2026-04-07 — 2

- Q: Must **colors, components, and styles** be reconciled against **local** design exports in **`designs/`**, not only Stitch MCP? → A: **Yes**—the **version-controlled** folder **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/`** (`code.html` for **token values**, **glass** CSS patterns, typography hooks; **`screen.png`** for **visual parity** checks) is the **mandatory in-repo** design source for **Briefcase** theming. Implementation MUST **adjust** shared **theme tokens** and **Briefcase** **Vue** components until **palette**, **glass**, **backdrop**, **radii**, and **primary/accent** treatment **match** those exports (**FR-002**, **FR-010**). **`designs/.../inspection_summary_history/`** MAY inform **non-color** rhythm only. **FR-006** / **SC-004** MUST cite these **`designs/`** paths (and optional Stitch IDs) in the plan—**no** secrets in git.

### Session 2026-04-07 — 3

- Q: How should **difficulty** be presented on The Briefcase? → A: **Three** **tile**-style options in a **radio-group** pattern aligned to **`designs/.../the_briefcase_main_menu/code.html`**, with **English** labels **Easy**, **Medium**, and **Hard**; **layout**, **selected-state** treatment (e.g. **primary** accent), and **glass**-adjacent styling MUST follow that export—a **`<select>`** dropdown MUST **not** be the primary difficulty control (**FR-010(a)**).

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

**Design reference:** **In-repo exports** under **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/`** (`code.html`, `screen.png`) are the **authoritative** source for **Briefcase (Main Menu)** **palette**, **backdrop** / **noise** treatment, **glass-panel** styling (blur, border, shadow), **radii**, and **layout** of **Main Menu** chrome (**three** **difficulty** **tiles**, **seed**, **Unlock showcase**, etc.). **Stitch MCP** MAY supplement **traceability** (**FR-006**) but MUST **not** be used to justify **drift** from those **`designs/`** files. **`designs/.../inspection_summary_history/`** MAY inform **non-color** consistency (e.g. typography rhythm, spacing) but MUST **not** override **Main Menu** **palette** when they disagree. Stitch **copy**, **flows**, and **logic** for other screens remain **out of scope** (**FR-003**); **English** strings follow **current** product decisions. The plan MUST list the **`designs/`** paths above and SHOULD record Stitch project/screen identifiers when available.

### User Story 1 - The Briefcase view in the new visual language (Priority: P1)

A player uses **home** as the **main entry** (DOM only), moves to **The Briefcase** and back with **in-app** controls, and can open the **game** view where the **canvas** tile surface lives. On **The Briefcase**, they see a **Main Menu–faithful** treatment: **colors** and **backdrop** **decorative background** from **`designs/.../the_briefcase_main_menu/`**, **glass-style** surfaces per that export, **three** **difficulty** **tiles** (**Easy** / **Medium** / **Hard**) per that export, a **seed** input, an **Unlock showcase** action, and other Main Menu affordances—coherent hierarchy and **English** product copy.

**Why this priority**: This is the agreed end state for the feature and the first place users experience the new theme.

**Independent Test**: From a running build, use **in-app** navigation **home → Briefcase → home**; use **in-app** navigation **home → game** and confirm the **canvas** host is present on the **game** route; on Briefcase, confirm **page backdrop** decorative treatment, **three** **difficulty** **tiles** (**Easy** / **Medium** / **Hard**), **seed** input, **Unlock showcase** control, and **glass-style** regions are present; confirm **English** copy and discoverability; narrow + wide viewport sanity.

**Playwright coverage**: Path: `e2e/briefcase-view.spec.ts`; maps to scenarios 1–8 below.

**Acceptance Scenarios**:

1. **Given** the user is on **home** (main entry, **no** canvas on that screen), **When** they use **in-app** navigation toward The Briefcase, **Then** they reach The Briefcase view showing **Main Menu–style** content (**page backdrop** per **FR-010(e)**, **three** **difficulty** **tiles** per **FR-010(a)**, **seed** input, **glass** surfaces, **Unlock showcase**, per **FR-010**) with **colors** and surfaces aligned to **`designs/.../the_briefcase_main_menu/`** exports (**FR-002**).
2. **Given** The Briefcase view is shown, **When** the user scans the screen, **Then** all visible labels, headings, and button text are in English.
3. **Given** a narrow or typical wide viewport, **When** The Briefcase view is displayed, **Then** primary content remains readable and primary actions remain reachable without horizontal clipping of essential UI.
4. **Given** the user is on The Briefcase, **When** they use **in-app** navigation back toward **home**, **Then** they return to **home** as the **main entry** (**DOM** shell **without** the tile canvas mounted on that route, per FR-007 / architecture clarification).
5. **Given** the user is on **home**, **When** they inspect navigation affordances, **Then** there is a **discoverable** control (or controls) to open The Briefcase whose visible text is **English**; and **Given** the user is on The Briefcase, **When** they inspect navigation affordances, **Then** there is a **discoverable** control to return **home** whose visible text is **English**.
6. **Given** the user is on **home**, **When** they use **in-app** navigation to start the **game**, **Then** they reach the **game** route where the **HTML canvas** tile surface is available inside the dedicated canvas component (**FR-007**), with **English** visible labels on that navigation control.
7. **Given** The Briefcase view is shown, **When** the user inspects **Main Menu** chrome, **Then** **three** **difficulty** **tiles** (**Easy**, **Medium**, **Hard**) are **visible** and **operable** (including **keyboard** navigation within the group; selection changes **client-visible** state), matching the **design** pattern in **`designs/.../the_briefcase_main_menu/code.html`**, a **seed** input is **visible** with an **English** label and accepts **typed** input (value may remain **client-only** until the game consumes it), an **Unlock showcase** control is **visible** and **activatable** (e.g. click without error; **stub** behavior acceptable until showcase content exists), and at least one **glass-style** panel or region is **visibly** present (e.g. frosted translucent treatment per theme tokens).
8. **Given** The Briefcase view is shown, **When** the user observes the **full-screen area behind** the main chrome (the **backdrop**, not only individual **glass** panels), **Then** a **decorative background treatment** consistent with **`designs/.../the_briefcase_main_menu/`** (e.g. base **background-dark**, **noise** layer where used) is **visibly** present—implemented as **DOM/CSS** on the Briefcase route (**FR-007**), with **reduced-motion** behavior per product/accessibility expectations (see Edge Cases).

---

### User Story 2 - Shared theme so future screens stay consistent (Priority: P2)

A designer or developer adds or adjusts UI for The Briefcase (or adjacent chrome) using the same theme rules so the screen does not drift into mixed styles.

**Why this priority**: Prevents one-off CSS and keeps the reference meaningful as the app grows.

**Independent Test**: Review theme documentation or token list and confirm The Briefcase implementation uses only those shared decisions for color, type scale, and core components.

**Playwright coverage**: Path: `e2e/briefcase-view.spec.ts` (reuse); maps to P2 scenario 1 below and cross-checks theme on **in-app** nav and **Main Menu** chrome from P1 scenarios 1, 4–8, optionally supplemented by visual regression or Storybook checks if adopted in plan.

**Acceptance Scenarios**:

1. **Given** the theme decisions extracted from **`designs/.../the_briefcase_main_menu/`** (and optional **`inspection_summary_history/`** for non-color rhythm), **When** The Briefcase is implemented, **Then** repeated visual patterns (e.g. **page backdrop**, **glass** panels, headers, **Unlock showcase**, **difficulty** **tiles**, **seed** field) use the same spacing, corner treatment, and **color roles** as defined for the theme.

---

### Edge Cases

- **`designs/`** exports missing or outdated: team falls back to Stitch MCP plus written theme notes in the plan and locks decisions before shipping The Briefcase; otherwise **`designs/.../the_briefcase_main_menu/`** is the default source of truth for tokens.
- **`code.html`** vs **`screen.png`** disagree on a **color role**: prefer **enumerated values** in **`code.html`** unless **SC-001** review explicitly chooses the PNG for that role and the plan records the exception.
- Very small viewports: critical actions remain accessible (e.g. scroll or stack) without hiding required controls.
- User prefers reduced motion: motion or animation on The Briefcase respects the product’s accessibility settings when those exist; if none exist yet, avoid decorative motion that blocks task completion.
- Long text in Briefcase labels: layout wraps or truncates with a clear pattern so nothing overlaps illegibly.
- User opens the app on a **deep-linked** Briefcase URL: **in-app** navigation to **home** and back to Briefcase still works; no dead ends.
- **Difficulty**, **seed**, or **Unlock showcase** has no backend yet: controls remain **usable** with **client-side** state or **stub** feedback; full game/showcase coupling (and passing **seed** into the game loop) is deferred to the **memory game / content** features without removing the controls from this screen.
- **Difficulty** **tiles**: the **radio/tile** group MUST expose a **proper** accessible name (e.g. **fieldset** + **legend** or **ARIA** equivalent), **visible** labels per tile, and **keyboard** operation (arrow keys / tab) consistent with native **radio** behavior or an accessible custom pattern.
- **Glass** effects and **reduced motion**: prefer **CSS** that degrades gracefully (e.g. solid fallback) if blur/backdrop is costly or user prefers reduced transparency (when settings exist).
- **Backdrop** motion or layered effects: if the **Main Menu** reference uses **animation** on the **background**, provide a **static** or **simplified** alternative under **`prefers-reduced-motion: reduce`** (or product equivalent) so text contrast and **FR-005** usability remain met.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST expose **The Briefcase** view as a user-visible screen for this feature’s scope.
- **FR-002**: The Briefcase view MUST use a **single coherent visual theme**. **Palette**, **glass** treatment (blur, borders, shadows), **backdrop** / **background** layers, **radii**, and **primary/accent** usage MUST be **aligned to** the **in-repo** design exports **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/`** (`code.html` and **`screen.png`** for verification). **Stitch MCP** MUST NOT justify systematic drift from those files. **`designs/.../inspection_summary_history/`** MAY inform **non-color** aspects (e.g. type scale, spacing rhythm) but MUST NOT override **Main Menu** **palette** when they conflict (appearance only; **FR-003** for copy and flows).
- **FR-003**: The product MUST **not** treat other Stitch screens, flows, or legacy Stitch logic as requirements for behavior or information architecture; current product requirements take precedence for content and flows.
- **FR-004**: All user-visible strings on The Briefcase view MUST be **English**.
- **FR-005**: The Briefcase view MUST remain **usable** on typical phone and desktop viewport widths used by the game (no critical controls only visible off-screen without scrolling).
- **FR-006**: Stakeholders MUST be able to **trace** which design references were used: at minimum the **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/`** paths above, plus optional Stitch project/screen identifiers or other exported artifacts **linked from the plan**—without embedding secrets in the repository.
- **FR-007**: **The Briefcase** view MUST be implemented as **Vue-rendered DOM** (standard HTML/CSS). The **playable memory tiles** MUST be rendered and interacted with on an **HTML canvas** hosted on a **dedicated game route** (not on **home**), via an encapsulated canvas component (e.g. **`GameCanvasShell`**). The primary game board MUST NOT be a DOM card grid. Non-game chrome MUST NOT be shifted onto canvas for this feature.
- **FR-008**: The product MUST provide **discoverable in-app navigation** between **home** (main entry, **DOM** only) and **The Briefcase**, **in both directions**. All visible labels on those navigation controls MUST be **English**.
- **FR-009**: The product MUST provide **discoverable in-app navigation** from **home** to the **game** route (where the canvas tile surface is mounted), with **English** labels, so users can **run the game** from the main entry without typing a URL.
- **FR-010**: The Briefcase view MUST present **Main Menu–style** chrome: (a) **difficulty** as **three** **tile**-style options (**radio group** or equivalent) with **English** labels **Easy**, **Medium**, and **Hard**, **visible** and **operable** (including **keyboard** operation and an accessible group label), **layout** and **selected-state** styling aligned to **`designs/.../the_briefcase_main_menu/code.html`**; a **`<select>`** MUST **not** be the primary difficulty control; **at minimum** **client-side** selection state MUST be observable; (b) **glass-style** (frosted / translucent) treatment on **at least one** designated region or panel consistent with the **Main Menu** reference; (c) an **Unlock showcase** control (**English** label) that is **visible** and **activatable** (**stub** or placeholder **downstream** behavior is acceptable until showcase content ships); (d) a **seed** input (**English** label) that is **visible** and accepts **user text entry** (value MAY be **client-only** or **stubbed** until the **game** consumes it); (e) a **page-level backdrop / background** decorative treatment matching the **Briefcase (Main Menu)** reference (**distinct** from **glass** panels alone—e.g. gradients, depth, texture, **subtle** motion as shown), implemented with **HTML/CSS** on the Briefcase view (**not** rendered as **canvas** UI per **FR-007**), with **reduced-motion** fallback as in Edge Cases. Other controls shown on the **Main Menu** reference SHOULD appear when feasible without violating **FR-003**.

### Key Entities

- **Theme reference set**: **`designs/.../the_briefcase_main_menu/`** as **authoritative** for **colors** and **Main Menu** chrome; **`inspection_summary_history/`** optional for **non-color** rhythm; Stitch MCP optional for **traceability**. **English** copy from **product**, not legacy export strings (**FR-003**).
- **The Briefcase view**: The in-app **Main Menu–style** screen: **backdrop** background treatment, **three** **difficulty** **tiles** (**Easy** / **Medium** / **Hard**), **seed** input, **glass** surfaces, **Unlock showcase**, and navigation per **FR-010**, under the **Main Menu** color theme.
- **Game canvas (tiles)**: The HTML canvas region where the memory **tiles** are drawn and interacted with; lives on the **game** route inside the canvas component; distinct from DOM chrome such as The Briefcase.
- **Home (main entry)**: The user-facing **landing** screen (**DOM** only): **does not** mount the tile canvas; provides **in-app** entry to **The Briefcase** and to the **game** route.
- **Game view**: The route/screen that mounts **`GameCanvasShell`** (or equivalent) and hosts the canvas tile surface.
- **Theme rules**: The documented decisions (e.g. color roles, type scale, spacing, component variants) that implementations MUST follow for The Briefcase and future work.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a review session, **at least two** reviewers independently agree that The Briefcase view matches **`designs/.../the_briefcase_main_menu/`** (**`screen.png`** + **`code.html`**) for **palette**, **page backdrop** / **background** treatment, **glass** treatment, and **Main Menu** control presence (**three** **difficulty** **tiles**, **seed** input, **Unlock showcase**), while **copy and behavior** follow **current** product rules (**FR-003**), not legacy export scripts.
- **SC-002**: **100%** of user-visible text on The Briefcase view in the shipped scope is English.
- **SC-003**: On a representative **phone-width** and **desktop-width** viewport, **100%** of primary tasks for this feature’s scope (reach The Briefcase from **home**, **change difficulty** selection, **enter or edit seed** text, **activate Unlock showcase** (stub OK), use **in-app** nav **home** and **game**, **canvas** reachable) can be completed without horizontal scrolling for essential controls.
- **SC-004**: Theme traceability: **100%** of shipped Briefcase styling changes can be mapped to an entry in the theme rules and/or to cited **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/`** paths (and optional Stitch identifiers) listed in the plan.

## Assumptions

- The repository includes **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/`** as the **primary** visual specification for **Briefcase** theming; the team MAY also use Stitch MCP for additional traceability. API keys and credentials are managed outside this specification document.
- **`inspection_summary_history/`** is **optional** for **non-color** theme hints only; **`the_briefcase_main_menu/`** owns **colors** and **Main Menu** chrome. Shipping the full Inspection screen is **not** required unless separately prioritized.
- **Difficulty**, **seed**, and **Unlock showcase** may use **stub** or **client-only** behavior until the **game loop** and **showcase content** features consume them; the **controls MUST remain on The Briefcase** with **English** labels (**FR-010**).
- Game rules, data, and copy for The Briefcase follow **current** product decisions; Stitch prototypes may show outdated labels or flows and are ignored except for look and feel.
- Playwright tests will assert stable, accessibility-friendly selectors and meaningful English text where practical; purely subjective pixel-perfect matching is validated by human review (SC-001), not only by automation.
- **UI split**: **Canvas** = game **tiles** only on the **game** route; **Vue/DOM** = **home**, **Briefcase**, and other chrome. Shared **theme tokens** SHOULD keep canvas-adjacent visuals coherent with DOM screens where practical (e.g. colors), without moving non-tile UI onto canvas.
