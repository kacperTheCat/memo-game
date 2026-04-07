# Feature Specification: CS2-themed tile libraries for memory play

**Feature Branch**: `003-csgo-tile-libraries`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "Create set of libraries using https://github.com/ByMykel/CSGO-API. We need to have set for 8x8 tiles (32 images). for each image create a object with rarity, color, and static path to resource"

## Clarifications

### Session 2026-04-07

- Q: What is the first delivery on the **game** route? → A: A **Game screen** that **only displays** a **grid of image tiles** (read-only presentation). **No** memory **game logic** in this phase (no flip-for-match behavior, no match detection, no win/lose flow).
- Q: How is grid size chosen? → A: The grid follows **difficulty selected on The Briefcase**: **Easy = 4×4**, **Medium = 6×6**, **Hard = 8×8**, consistent with product copy (**4×4 Grid** / **6×6 Grid** / **8×8 Grid** under each difficulty tile).
- Q: How are image files produced for the app? → A: A **one-time** script (run by developers/build pipeline) **fetches or copies** assets into **static** locations; the running app **does not** depend on live calls to external item APIs for gallery images.

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Unit and component tests cover pure logic as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan. **This phase** focuses on the **Game** screen **grid display** and **Briefcase-linked** configuration; Stitch is **not** required unless the plan adds new visual design beyond existing routes.

### User Story 1 - Game screen shows image grid from Briefcase difficulty (Priority: P1)

On **The Briefcase**, the player chooses **Easy**, **Medium**, or **Hard**. When they open the **Game** screen, they see a **rectangular grid of tiles** whose **row and column count** matches that difficulty (**4×4**, **6×6**, or **8×8**). Each cell shows **artwork** from the curated CS2-themed library (rarity and color remain available for optional chrome such as borders). **There is no** interactive memory rule set in this phase—tiles are **display-only** (no flip-to-reveal pairing, no match feedback).

**Why this priority**: Delivers the agreed milestone: visible **Game** surface wired to **Briefcase** configuration, using **real** bundled art, before gameplay logic.

**Independent Test**: Set each difficulty on Briefcase, navigate to Game, count rows/columns and confirm every cell renders an image without broken artwork in a clean build.

**Playwright coverage**: `e2e/csgo-tile-library-game.spec.ts`; exercises User Story 1 acceptance scenarios 1–3.

**Acceptance Scenarios**:

1. **Given** the user selects **Hard** on The Briefcase, **When** they view the Game screen, **Then** the grid is **8×8** (**64** cells) and each cell displays image artwork from the curated data (via static paths).
2. **Given** the user selects **Easy** (respectively **Medium**), **When** they view the Game screen, **Then** the grid is **4×4** (**16** cells) (respectively **6×6** (**36** cells)) with each cell displaying image artwork.
3. **Given** the Game screen is shown, **When** the user attempts interactions implied by memory play (e.g. expecting pair matching), **Then** the product **does not** apply memory rules in this phase—behavior is **display-only** unless a later feature adds logic (documented out of scope below).

---

### User Story 2 - Curated libraries and metadata for all supported grid sizes (Priority: P2)

The product maintains **curated tile libraries** with **metadata** (rarity, color, static path) so that the **largest** grid (**Hard**, **8×8**) can be filled with **32 unique images** each used **twice** when memory logic exists later; for **this display-only phase**, smaller grids use a **deterministic subset** of the same ordered library (see Assumptions) so Easy and Medium still show coherent art without requiring separate asset pipelines.

**Why this priority**: Keeps one pipeline (script + library file) while supporting all three Briefcase difficulties.

**Independent Test**: With script output and library data present, verify Hard has **32** entries; verify Easy and Medium grids only reference entries that exist and resolve.

**Playwright coverage**: `e2e/csgo-tile-library-selection.spec.ts` or reuse `e2e/csgo-tile-library-game.spec.ts` if a single spec covers difficulty switching; maps to scenario 1 below.

**Acceptance Scenarios**:

1. **Given** a shipped library for **Hard**, **When** automated validation runs, **Then** the library contains **exactly 32** entries with rarity, color, and static path; **Hard** grid rendering uses each of those **32** identities **exactly twice** across **64** cells (**deterministic** placement—visual duplication **without** interactive matching).

---

### User Story 3 - Trustworthy metadata and build validation (Priority: P3)

Someone reviewing content (or automated checks) can confirm that every library entry includes rarity, color, and static path and that counts and references are internally consistent.

**Why this priority**: Reduces broken builds and silent missing art after the one-time fetch script.

**Independent Test**: Run automated checks that validate schema, **32** entries for the primary **Hard** library, path resolvability, and that grid sizes never request more unique tiles than the library provides.

**Playwright coverage**: `e2e/csgo-tile-library-validation.spec.ts`; exercises acceptance scenario 1 from a user-facing angle (preview build: grid **cell count** matches difficulty **16 / 36 / 64** via `data-cells` on the game shell, complementing Vitest library validation).

**Acceptance Scenarios**:

1. **Given** a published library definition, **When** validation runs in continuous integration, **Then** any missing rarity, missing color, duplicate static path misuse, or wrong **Hard** tile count fails the check with a clear message.

---

### Edge Cases

- **Remote image unavailable**: The **one-time script** SHOULD vendor images so the app never depends on third-party uptime at runtime.
- **Briefcase difficulty not yet applied on Game**: If shared state is missing (e.g. deep link), Game MUST use a **documented default** (e.g. **Medium**) or **safe empty state** with **English** copy—plan MUST choose one and tests MUST lock it.
- **Duplicate rarity or color**: Multiple tiles may share the same rarity tier or color; cells remain distinguishable by **identity** when memory logic arrives.
- **Partial library**: A **Hard** library with fewer or more than **32** entries MUST be rejected by validation.
- **Localization**: User-visible labels remain **English** per constitution.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST provide at least one **tile library**: a named collection of exactly **32** distinct tile entries aligned with **Hard**; the **8×8** grid (**64** cells) MUST show each of those **32** identities **exactly twice** (deterministic layout, **no** match interaction required in this phase).
- **FR-002**: Each tile entry MUST expose: **rarity** (human-readable label suitable for UI), **color** (a single value suitable for theming, e.g. hex), and **static path** (stable path to artwork **produced by the one-time asset script** and packaged with the application).
- **FR-003**: Tile libraries MUST be suitable for **multiple libraries** in the same product over time; each **primary** library for **Hard** independently satisfies FR-001–FR-002.
- **FR-004**: Curated content for these libraries MUST be traceable to the public Counter-Strike 2 item reference dataset described under **Data provenance** in Assumptions, including rarity and color aligned with that source’s semantics for the chosen items.
- **FR-005**: Automated validation MUST verify per **Hard** library: exactly **32** entries, presence of rarity, color, and static path, and that static paths refer to files present after the asset script runs.
- **FR-006**: The **Game** screen MUST render a **grid of image tiles** whose dimensions are **derived from the difficulty** last selected on **The Briefcase** (**Easy 4×4**, **Medium 6×6**, **Hard 8×8**).
- **FR-007**: **This delivery** MUST **not** implement memory **gameplay** rules (no pair matching, no win condition, no flip-to-hide/reveal cycle required for play). Display-only behavior is intentional.
- **FR-008**: **Difficulty selection** on The Briefcase and **grid rendering** on Game MUST share **consistent client-visible configuration** (e.g. shared store or equivalent) so navigation **Briefcase → Game** reflects the chosen difficulty without manual re-selection on Game.
- **FR-009**: For **Easy** and **Medium**, the grid MUST be filled using the **first 8** and **first 18** library identities respectively, each appearing **exactly twice** per **Grid filling** in Assumptions (deterministic order; **no** interactive matching).

### Key Entities *(include if feature involves data)*

- **Tile entry**: One image identity in the library; attributes are rarity label, display color, static artwork path, and stable id.
- **Tile library**: Named grouping of **32** tile entries for **Hard**; smaller grids consume ordered subsets per Assumptions.
- **Difficulty-driven grid**: Mapping **easy | medium | hard** → **(4,4), (6,6), (8,8)** cell counts, sourced from Briefcase UI.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For each difficulty (**Easy**, **Medium**, **Hard**), on a clean install after assets are generated, **100%** of grid cells on the Game screen show **non-broken** artwork (no empty or broken-image state attributable to library data or missing script output).
- **SC-002**: Each shipped **Hard** library contains **exactly 32** entries; automated validation fails the build otherwise.
- **SC-003**: **100%** of entries in a shipped **Hard** library include non-empty rarity, a defined color value, and a static path that resolves in the production bundle.
- **SC-004**: After choosing a difficulty on The Briefcase and opening Game, **95%** of test users in moderated or scripted checks can confirm the grid size matches the subtitle for that difficulty (**4×4**, **6×6**, **8×8**) without contradiction.

## Out of scope (this phase)

- Memory rules: shuffling pairs, revealing/hiding faces, match detection, scoring, timers, end-of-game states.
- Live runtime fetching of item JSON or images from external hosts (except the **one-time** maintainer script).

## Assumptions

- **Grid filling (display-only)**: Cell counts are **Easy 16**, **Medium 36**, **Hard 64**. The **32-entry** library uses **stable ordering**; **Easy** uses the **first 8** identities **twice each** (8×2=16); **Medium** uses the **first 18** **twice each** (18×2=36); **Hard** uses **all 32** **twice each** (32×2=64). Layout is **deterministic** (plan records ordering rules); **no** interactive pair-matching.
- **Board math (future memory)**: When gameplay arrives, the same per-identity **twice** pattern matches standard memory.
- **Data provenance**: Item metadata and reference image URLs come from the open [ByMykel CSGO-API](https://github.com/ByMykel/CSGO-API) dataset (MIT). A **one-time script** downloads or copies images and emits bundled paths/metadata.
- **Scope**: No live calls to external item APIs during normal app use after assets are generated.
- **Briefcase link**: Difficulty is the **three-option** control on The Briefcase (**Easy** / **Medium** / **Hard**) from feature **002**.

## Dependencies

- ByMykel CSGO-API JSON and image references for chosen items, under its license terms (**maintainer script only**).
- **The Briefcase** difficulty selection and shared client configuration so **Game** reads grid size (alignment with feature **002**).
- **Committed** `public/tiles/*` and `src/data/tile-library.json` after running the maintainer script locally or in CI; **`pnpm test`** validates them on every run (regenerate with `pnpm run fetch-tiles` when refreshing art).
