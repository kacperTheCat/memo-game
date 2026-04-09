# Feature Specification: Layout balance, maintainability refactor, and screen visual checks

**Feature Branch**: `013-layout-refactor-e2e`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "REFACTOR & Final tuning — game area shifted too far right (canvas on the right); adjust layout. Senior-level review of components, composables, and utilities: helpers, redundancy, complicated patterns, unnecessary coupling, heavy nested loops, naming. Add basic end-to-end visual tests for each screen and extend continuous integration if needed."

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

### User Story 1 - Balanced game layout on desktop and mobile (Priority: P1)

Players open the game screen and see the memory play area (canvas and its surrounding frame or controls) positioned so it feels centered and usable: the playable region is not visually “stuck” against the right edge of the viewport in common layouts, and touch or pointer targets remain comfortable on narrow screens.

**Why this priority**: Directly affects core gameplay usability and first impression; aligns with responsive product expectations.

**Independent Test**: Open the game route at representative viewport sizes and confirm the play area placement matches agreed layout targets (manual or automated layout assertions).

**Playwright coverage**: Path: `e2e/game-layout-balance.spec.ts` (or extend an existing game layout spec if consolidated); maps to scenarios 1–3 below. Vitest: any extracted pure layout math or breakpoints, if applicable.

**Acceptance Scenarios**:

1. **Given** a desktop-class viewport, **When** the user views the game screen with a typical in-progress or new game, **Then** the canvas play area is not disproportionately hugging the right edge; spacing left and right is balanced per the agreed design reference.
2. **Given** a mobile viewport, **When** the user views the game screen, **Then** the play area remains fully visible and interactable without horizontal scrolling for the default game layout.
3. **Given** the user resizes the window across breakpoints, **When** layout reflows, **Then** no critical control (e.g. primary navigation or abandon flow) overlaps the canvas in a way that blocks play.

---

### User Story 2 - Cleaner structure without changing intended behavior (Priority: P2)

Maintainers and reviewers can navigate the UI and game-support code (reusable building blocks, shared logic, and small utilities) with less duplication, clearer names, and fewer unnecessary cross-module dependencies. Player-visible behavior and persisted data rules stay the same except where Story 1 requires layout adjustment.

**Why this priority**: Reduces cost of future features and bugs; supports constitution goals for a reviewable codebase.

**Independent Test**: Compare behavior and automated tests before and after refactor; suite green; optional targeted review checklist signed off in plan/tasks.

**Playwright coverage**: Existing gameplay and navigation specs continue to pass; no new story-specific file required unless a new `e2e/` file is introduced solely for regression bundling—prefer extending existing specs. Vitest: updated or new unit tests for any extracted or consolidated pure functions.

**Acceptance Scenarios**:

1. **Given** the application after refactor, **When** a user completes primary flows (home → game → win or abandon, briefcase access), **Then** outcomes match pre-refactor expectations except for intentional layout improvements from Story 1.
2. **Given** duplicated or unclear helpers identified in review, **When** changes are applied, **Then** a single obvious place exists for each concern (or documented rationale if duplication must remain).
3. **Given** modules with tight coupling, **When** refactor is complete, **Then** dependencies flow in a predictable direction without circular imports that break the build.

---

### User Story 3 - Basic visual regression coverage for each main screen (Priority: P3)

Each primary application screen has a minimal automated visual check so unintended layout or styling regressions are caught in continuous integration.

**Why this priority**: Protects Stories 1–2 and overall polish; complements functional E2E.

**Independent Test**: Run the visual E2E suite locally and in CI; failures surface screenshot or snapshot diffs for review.

**Playwright coverage**: Path: `e2e/screens-visual.spec.ts` (single file with one describe per screen) or `e2e/visual-home.spec.ts`, `e2e/visual-game.spec.ts`, `e2e/visual-briefcase.spec.ts` if split; maps to scenarios 1–3 below.

**Acceptance Scenarios**:

1. **Given** a stable preview build and fixed viewport(s) defined in the plan, **When** the home screen loads, **Then** a baseline screenshot (or project-standard visual assertion) is captured and compared in CI.
2. **Given** the same conditions, **When** the game screen loads (deterministic empty or seeded state as agreed in plan), **Then** a baseline visual check runs successfully.
3. **Given** the same conditions, **When** the briefcase screen loads, **Then** a baseline visual check runs successfully.

---

### Edge Cases

- Very small viewports (short height or narrow width): play area or chrome may stack; must remain usable without blocking the canvas.
- High DPI / device pixel ratio: visual baselines must use the approach chosen in the plan (e.g. consistent device scale) to avoid flaky comparisons.
- Offline or PWA-installed context: visual tests run against preview build; service worker quirks documented if they affect screenshots.
- Dynamic content (timers, animations): screenshots taken after explicit waits or reduced motion as specified in the plan to avoid flake.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game screen layout MUST position the canvas play area so it is visually balanced on desktop and usable on mobile, correcting the current over-emphasis toward the right side of the screen.
- **FR-002**: The application MUST preserve existing user-visible behavior for game rules, navigation, persistence, and settings except for intentional layout changes under FR-001.
- **FR-003**: The codebase MUST be reviewed and refactored where justified to reduce redundant helpers, unclear names, avoidable coupling, and unnecessarily complex control flow (including nested loops that can be simplified without behavior change).
- **FR-004**: Automated end-to-end tests MUST include basic visual checks for the **home**, **game**, and **briefcase** screens at agreed viewport(s) and stable application state.
- **FR-005**: If the project’s continuous integration pipeline does not already run the new visual tests, it MUST be extended so those tests run on every merge candidate (same ordering as existing policy: unit tests before E2E, build, preview, Playwright).

### Key Entities

- **Screen (route-level view)**: Home, Game, Briefcase — each is a target for one basic visual baseline.
- **Layout region**: The framed game area containing the canvas and adjacent chrome — subject to FR-001.
- **Visual baseline**: The approved reference image or snapshot artifact used for comparison in CI.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a defined desktop reference viewport, reviewers agree (checklist or design reference) that the game canvas is no longer disproportionately aligned to the right edge compared to the pre-change baseline.
- **SC-002**: 100% of primary screens (home, game, briefcase) have at least one automated visual check that passes on a clean integration branch.
- **SC-003**: All automated quality checks required for merge (including the new visual checks) pass on the integration branch.
- **SC-004**: The application continues to build and ship as before; any intentional retained duplication of critical game logic is documented in the plan with rationale.

## Assumptions

- “Basic” visual tests means screenshot comparison or the project’s established Playwright visual pattern at one or two fixed viewports—not a full pixel-perfect matrix across all browsers unless the plan expands scope.
- Game screen visual baseline uses a deterministic state (e.g. new game or fixed seed) agreed in `plan.md` to avoid random tile layouts breaking snapshots.
- Stitch or other design references, if any, will be cited in `plan.md` for layout targets; this spec does not mandate a specific pixel offset.
- Refactor scope excludes changing constitution rules, swapping canvas for DOM tiles, or adding a backend.

