# Feature Specification: Deterministic game seed (Briefcase)

**Feature Branch**: `005-seed-tile-layout`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Seed Implementation — In briefcase there is input for a seed. When user enters 9 digits, then based on digits we need to generate the tiles layout. Layout must be generated exactly the same for the same digits, even on different machines. Seed input should be number type with a mask xxx-xxx-xxx. Seed is optional."

## Clarifications

### Session 2026-04-08 (plan / tasks)

- **Phased UX**: **User Story 3** delivers the **`xxx-xxx-xxx`** mask. **User Story 1** automated tests **MAY** use **nine-digit entry without hyphens** first; **FR-001** / **FR-002** are fully satisfied once **US3** ships.
- **Stateless dealing**: Initial layout for a **new** round is determined by **pure functions** of **`(difficulty, seedNine)`**; Briefcase→game passes **`seedNine`** via **navigation state** (see **`plan.md`** / **`data-model.md`**), not a **pending consume** store.

### Session 2026-04-08 (clarify)

- Q: May the user enter more than nine digits in the seed field? → A: **No** — it **MUST** be **impossible** to accumulate more than **nine** digits (typing, paste, and any edit path **MUST** enforce the cap, e.g. truncate or block excess digits).
- Q: When the Briefcase seed changes, how does that interact with an in-progress round? → A: **Same flow as changing difficulty** — if a round is **in progress**, changing the seed **MUST** use the **same** abandon / confirmation and session-finalization behavior as changing **difficulty** away from the in-progress session, so the **next** start from The Briefcase begins a **new** round reflecting the **updated** seed (no silent mismatch between displayed seed and the deal in memory).
- Q: When should incomplete-seed validation (messaging / error chrome / disabling Unlock and Play) run relative to typing? → A: **On blur** — while the seed field **has focus**, the product **MUST NOT** show incomplete-seed validation (**no** nine-digit requirement message, **no** `aria-invalid` or error border **for** partial 1–8 digit entry, and **Unlock** / header **Play** **MUST NOT** be disabled **solely** because of partial entry **until** the field **blurs**). **On blur**, if digit count is **1–8**, **then** show the requirement message and disable those actions. The **nine-digit hard cap** (no tenth digit, paste truncation) **MUST** still apply **on every input**, not deferred to blur. **Navigation to `/game`** **MUST** remain **blocked** whenever digit count is **1–8** (even before blur); clicks **MAY** no-op silently until blur surfaces the message.

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan. *(Design for the seed field follows existing **The Briefcase (Main Menu)** references already in repo; no new Stitch asset required unless visual refresh is requested.)*

### User Story 1 - Reproducible deal from a full seed (Priority: P1)

A player opens **The Briefcase**, enters **nine decimal digits** in the seed field (presented with grouping **xxx-xxx-xxx**), chooses difficulty, and starts a round. The **tile deal**—which item appears in which grid position before play—**MUST** be **fully determined** by those nine digits together with the **selected difficulty** (grid size / pair count), so that **any** player who enters the **same** nine digits and **same** difficulty gets the **same** deal. The same inputs **MUST** yield the **same** deal on **different** devices and sessions.

**Why this priority**: Shareable seeds and fair challenges depend on **bit-for-bit** (or equivalently, **observably identical**) deals across users and machines.

**Independent Test**: Set a known nine-digit seed and difficulty, start the game, record the initial concealed grid’s underlying pair placements (or an equivalent canonical description); repeat on another session or device and compare.

**Playwright coverage**: `e2e/briefcase-seed-layout.spec.ts` — scenarios 1–3 in this story (seed entry, navigation to game, observable consistency checks at the level the product exposes in the DOM or test hooks). For **`localStorage` debounce**, full **`goto` reloads**, and **`data-deal-init`** vs snapshot restore, see **004** [`specs/004-game-core-logic/contracts/README.md`](../004-game-core-logic/contracts/README.md) § *Playwright / integration notes*.

**Acceptance Scenarios**:

1. **Given** The Briefcase is open and difficulty is set to a fixed choice, **When** the player enters a **complete** valid nine-digit seed (see **FR-002**) and starts a round, **Then** the new round’s initial deal is **fully determined** by that seed and difficulty.
2. **Given** two separate sessions (or devices), **When** both use the **same** nine-digit seed and **same** difficulty and each starts a new round, **Then** the initial deals **match** (same identity placement in corresponding cells).
3. **Given** a complete valid seed, **When** the player changes **only** the seed to a **different** complete valid nine-digit value (same difficulty), **Then** the initial deal **may** change; it **MUST** remain stable if they restart with the **unchanged** seed and difficulty.

---

### User Story 2 - Optional seed and incomplete entry (Priority: P2)

A player may leave the seed field **empty** or **partially filled**. The seed **MUST** remain **optional**: the product **MUST** still allow starting a round without a complete nine-digit seed, using the product’s **existing** behavior for non-seeded starts (no requirement that empty-seed deals match across devices). If the field is **incomplete** (fewer than nine digits), the system **MUST NOT** treat the input as a deterministic seed for the next deal until it becomes complete (or the player clears it).

**Why this priority**: Backward compatibility and low friction for casual play; avoids surprising “wrong” deals from half-typed values.

**Independent Test**: Start rounds with empty seed, partial seed, then complete seed; verify only the complete case triggers cross-session reproducibility requirements.

**Playwright coverage**: `e2e/briefcase-seed-layout.spec.ts` — scenarios 1–2 in this story (empty optional path, partial input behavior).

**Acceptance Scenarios**:

1. **Given** the seed field is **empty**, **When** the player starts a round, **Then** the game starts **without** applying a nine-digit deterministic seed (behavior aligns with pre-feature **non-seeded** deals).
2. **Given** the seed field contains **fewer than nine** digits (and is not cleared), **When** the player starts a round, **Then** the deal **MUST NOT** be driven by a partial seed as if it were complete; behavior matches the **empty / non-seeded** path unless the product explicitly blocks start (out of scope unless added—default is allow start without deterministic seed).

---

### User Story 3 - Numeric seed entry with xxx-xxx-xxx mask (Priority: P3)

The Briefcase seed control **MUST** behave as **numeric** entry: **only** decimal digits **0–9** are accepted into the nine positions. The visible format **MUST** follow the mask **xxx-xxx-xxx** (three groups of three digits separated by hyphens). Typing, pasting, and editing **MUST** keep the mask coherent (e.g. hyphens appear in fixed positions; non-digits are rejected or stripped—**English** validation or helper text if needed).

**Why this priority**: Prevents ambiguous seeds and matches the product’s stated format; supports reliable sharing (“use seed **123-456-789**”).

**Independent Test**: Type and paste valid and invalid characters; verify displayed value and digit count.

**Playwright coverage**: `e2e/briefcase-seed-layout.spec.ts` — scenarios 1–4 in this story (mask shape, rejection of letters, full nine-digit entry, **no tenth digit** after nine, paste truncation to nine, **blur**-gated incomplete messaging).

**Acceptance Scenarios**:

1. **Given** the seed field is focused, **When** the user types **only** digits, **Then** the value shows as **xxx-xxx-xxx** with up to **nine** digits total and hyphens in the correct places, and **a tenth digit cannot** be entered (input **MUST** reject or drop excess digits so the canonical digit count **never** exceeds **nine**).
2. **Given** the seed field is focused, **When** the user attempts to enter **non-digit** characters (letters, symbols), **Then** those characters **do not** become part of the nine-digit value (stripped or blocked).
3. **Given** the user pastes a string such as **123456789** or a longer digit run, **When** the control normalizes input, **Then** the result is a valid masked seed using **at most** the **first nine** decimal digits only (**123-456-789** for a longer paste starting with those nine), not a corrupted label or a value with more than nine digits.
4. **Given** the user has entered **1–8** digits and the field is still **focused**, **When** the UI is observed, **Then** incomplete-seed validation (**FR-005b**) **MUST NOT** be visible (no incomplete message, no error border/`aria-invalid` for partial entry, **Unlock** / **Play** not disabled **only** for that reason). **When** the field **blurs** with **1–8** digits still present, **Then** the nine-digit requirement message **MUST** appear and **Unlock** / **Play** **MUST** be disabled until the field is cleared or completed to nine digits.

---

### Edge Cases

- **All zeros**: **000-000-000** is a **valid** complete seed and **MUST** yield a **deterministic** deal like any other nine-digit value.
- **Leading zeros in a group**: e.g. **001-002-003** — each group is **three character positions** for digits; leading zeros **MUST** be preserved in the canonical nine-digit value used for the deal.
- **Field cleared mid-entry**: Returning to **empty** restores **optional / non-seeded** start behavior and clears incomplete-seed validation state from **FR-005b**.
- **Blur vs focus**: After **blur** exposed incomplete-seed validation, **focusing** again **MAY** keep or hide the message per implementation, but the **nine-digit cap** **MUST** remain enforced on input; **navigation** **MUST** stay blocked for **1–8** digits until cleared or completed.
- **Difficulty change with same seed**: Changing difficulty **MUST** change grid size (per existing rules); the deal for seed **S** on difficulty **D** **MUST** be stable, and **S** on **D′** **MUST** be the correct deal for that pair (**independent** from the deal for **S** on **D**).
- **In-progress session vs seed change**: If a round is **in progress**, changing the Briefcase seed **MUST** follow the **same** abandon / confirmation and session-finalization flow as changing **difficulty** relative to that session (see existing **FR-014** / Briefcase navigation rules). After acceptance, the **next** navigation to the game **MUST** start a **new** round using the **current** seed and difficulty—**no** retroactive reshuffle of the saved in-progress board from a seed edit alone.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Briefcase **MUST** expose a seed input that accepts **optional** numeric content with display mask **xxx-xxx-xxx** (**English** label and any helper copy per product style).
- **FR-002**: A **complete seed** is **exactly nine** decimal digits **0–9**, interpreted in order (grouping in the UI **MUST** map to the same nine-digit sequence for deal generation).
- **FR-003**: When the player starts a new round with a **complete seed** and a chosen **difficulty**, the system **MUST** build the **initial tile deal** (placement of pair identities on the grid) using a **fixed rule** that depends **only** on that seed, that difficulty, and the **defined** set of tile identities for the round—so the same inputs always produce the **same** initial deal on any supported client.
- **FR-004**: When **no** complete seed is present for a new round, the system **MUST** **not** apply the deterministic nine-digit rule; behavior **MUST** match the product’s **established** non-seeded deal behavior for that path.
- **FR-005**: The seed field **MUST** reject or normalize away **non-digit** input so the stored nine-digit value contains **only** **0–9**.
- **FR-005a**: The seed field **MUST** **cap** the digit sequence at **exactly nine** digits maximum: typing **MUST NOT** add a **tenth** digit to the run, and paste / bulk input **MUST** retain **only** the **first nine** decimal digits (after stripping non-digits). It **MUST** be **impossible** for the user to end up with more than nine digits in the canonical value. This cap **MUST** be evaluated **on every input** (not deferred to **blur**).
- **FR-005b**: When canonical digit count is **1–8**, **user-visible** incomplete-seed validation (English message, error border / **`aria-invalid`** for that state, disabling **Unlock** and Briefcase header **Play**) **MUST** appear **only after** the seed control **`blur`**s with that partial value. While **focused**, that validation chrome **MUST NOT** show **only** because digit count is **1–8**. **Briefcase → `/game`** **MUST** still be **prevented** whenever count is **1–8** regardless of blur (see navigation guard in implementation).
- **FR-006**: The chosen seed value (when complete) **MUST** be available when transitioning from The Briefcase to the game so the game round initializes the deal **from** that seed (no silent loss of seed on navigation).
- **FR-006a**: If a **game session is in progress** and the player **changes** the Briefcase seed (any change to the field’s digit content vs the value that started the current in-progress round, including clear-to-empty), the product **MUST** apply the **same** user-visible flow as changing **difficulty** for that in-progress session (confirm abandon, finalize session, reset round state as today’s difficulty rule does), so the **next** Briefcase→game start is a **new** round consistent with the **updated** seed and selected difficulty.
- **FR-007**: The delivery **MUST** be verifiable by automated tests: **deal derivation** is identical for the same seed and difficulty across repeated runs (including **documented** reference seeds), and Briefcase seed entry plus starting a round with a fixed seed yields a **stable** observable outcome appropriate to the UI (paths and layering follow the **User Scenarios & Testing** subsection and repository test standards).

### Key Entities

- **Game seed (nine-digit)**: The ordered sequence of nine digits **0–9** entered under the **xxx-xxx-xxx** mask; **optional**; when complete, uniquely identifies the **deterministic** deal **for a given difficulty** and **tile identity set**.
- **Tile deal (initial layout)**: The assignment of **pair identities** to **grid cells** at round start, before the player flips tiles; **MUST** be reproducible from **Game seed** + **difficulty** + **active library** per **FR-003**.
- **Difficulty**: Existing **Easy** / **Medium** / **Hard** (or successor) selection that sets grid size; **MUST** participate in deterministic deal generation so the same seed does **not** imply the same deal across **different** sizes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For **any** complete nine-digit seed and fixed difficulty, **100%** of repeated new-round starts (same build, same settings) produce **identical** initial deals when compared by a **canonical** description of cell-to-identity mapping.
- **SC-002**: For **at least five** representative seed values spanning leading zeros and high digits, **independent** verification (e.g. two testers or two devices) reports **matching** initial deals **100%** of the time when difficulty and content version are the same.
- **SC-003**: **100%** of Briefcase seed field submissions in tests show **only** digits in the nine positions and hyphens only as **xxx-xxx-xxx** separators when the user types or pastes typical inputs (digits-only paste, masked paste); tests **MUST** cover **no tenth digit** after a full nine, **truncation** on overlong digit paste, and **blur**-gated incomplete messaging (**no** incomplete chrome while focused with partial digits; **after blur**, message + disabled CTAs).
- **SC-004**: With an **empty** seed field, players **can** still start a round in **one** continuous flow from The Briefcase without being **forced** to enter digits (no regression vs optional seed expectation).

## Assumptions

- **The Briefcase** already includes a seed control (**FR-010** from the theme spec); this feature **defines** its **format**, **validation**, and **coupling** to the **game deal**, not the presence of the field.
- **Non-seeded** rounds (empty or incomplete seed) continue to use whatever **pseudo-random** or **default** dealing behavior exists today; **cross-device equality** is **required only** for **complete** nine-digit seeds.
- **Tile image library** and **difficulty presets** are **versioned** implicitly by the app: if the library or pair count rules change in a future release, the **same numeric seed** **may** produce a **different** deal than in an older version—**FR-003** applies **within** a **single** released definition of content and grid rules.
- **In-progress** game restore and persistence (**004**) **MUST** remain consistent: restoring a saved round **MUST** **not** re-randomize from seed in a way that breaks the saved board; new deals **only** when the player intentionally starts a **new** round.

## Dependencies

- **002-stitch-theme-briefcase**: Briefcase shell, seed **testid** **`briefcase-seed-input`**, **English** copy.
- **003-csgo-tile-libraries** / **004-game-core-logic**: Grid sizes, identities, dealing, and session lifecycle—this feature **adds** deterministic dealing **from** seed without removing existing behaviors for **no** seed.
