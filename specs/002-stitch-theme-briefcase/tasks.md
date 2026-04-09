---
description: "Task list for 002-stitch-theme-briefcase (Stitch theme + Briefcase + home/game/briefcase routes)"
---

# Tasks: Stitch-Referenced Theme and The Briefcase View

**Input**: Design documents from `/specs/002-stitch-theme-briefcase/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/briefcase-view.e2e.schema.json](./contracts/briefcase-view.e2e.schema.json), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests (mandatory)**: TDD per `.specify/memory/constitution.md`—**Vitest** and **Playwright**; failing tests before implementation.

**Organization**: Phases by dependency order; **User Story 1 (P1)** is the **MVP**. **Phase 8** (**FR-010(a)** **radio tiles** per **spec Session 2026-04-07 — 3** + **`code.html`**) is the **active** implementation gap—**T028** shipped a **`<select>`**; **T035–T038** replace it and refresh tests. Phases **1–7** are **[x]** in the ledger below. **T022** is **optional** (Stitch MCP IDs); **FR-006** minimum met by **`designs/`** paths in **plan.md**.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable
- **[US1]** / **[US2]**: user story from [spec.md](./spec.md)

## Phase 1: Setup (shared infrastructure)

**Purpose**: Routing dependency on the existing Vue 3 + Vite repo.

- [x] T001 Add **vue-router** `^4` dependency and lockfile updates via `package.json` at repository root

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: **Home** (no canvas), **GameView** (canvas), **Briefcase** stub, router, theme tokens.

**⚠️** No user story completion until this phase is done.

- [x] T002 Create `src/views/home/HomeView.vue` with **DOM** main entry only (**do not** import `GameCanvasShell`); migrate non-canvas welcome/header content from `src/App.vue` as needed at repository root
- [x] T003 Create `src/views/game/GameView.vue` that **only** mounts `src/components/game/GameCanvasShell.vue` (plus optional **English** chrome, e.g. link home) at repository root
- [x] T004 Create stub `src/views/briefcase/BriefcaseViewPage.vue` with root `data-testid="briefcase-view"` at repository root
- [x] T005 Create `src/router/index.ts` with routes **`/`** → `HomeView`, **`/game`** → `GameView`, **`/briefcase`** → `BriefcaseViewPage` at repository root
- [x] T006 Register the router in `src/main.ts` at repository root
- [x] T007 Replace inline shell in `src/App.vue` with `<RouterView />` (or layout + `RouterView`) at repository root
- [x] T008 Add `data-testid="game-canvas"` to the `<canvas>` (or wrapper) in `src/components/game/GameCanvasShell.vue` per `specs/002-stitch-theme-briefcase/contracts/briefcase-view.e2e.schema.json`
- [x] T009 Add Stitch-aligned **semantic CSS custom properties** and Tailwind v4 **`@theme`** mapping in `src/style.css` at repository root (optional `src/theme/tokens.css`)

**Checkpoint**: **`/`** shows **home** without **`game-canvas`**; **`/game`** shows canvas; **`/briefcase`** shows stub Briefcase.

---

## Phase 3: User Story 1 — Briefcase + navigation (Priority: P1) 🎯 MVP

**Goal**: Themed **Briefcase**; **FR-008** home ↔ briefcase; **FR-009** home → **game**; **P1 scenarios 1–8** (nav, canvas placement, **seed**, **backdrop**); canvas **only** on **`/game`**.

**Independent Test**: **pnpm dev** — home ↔ briefcase; home → game → **`game-canvas`**; home has **no** `game-canvas`; deep **`/briefcase`** round-trip; **English**; **`briefcase-seed-input`** and **`briefcase-backdrop`**; narrow + wide viewports.

### Tests for User Story 1 (mandatory) ⚠️

> Write **first**; confirm **FAIL** before implementation.

- [x] T010 [P] [US1] Add failing Vitest `src/components/briefcase/BriefcaseView.spec.ts` for English copy and Briefcase **content** testids (`briefcase-seed-input`, etc.); root `data-testid="briefcase-view"` remains on `src/views/briefcase/BriefcaseViewPage.vue`
- [x] T011 [P] [US1] Add failing Playwright `e2e/briefcase-view.spec.ts` for **P1 scenarios 1–8** shell: **`nav-to-briefcase`**, **`nav-to-home`**, **`nav-to-game`**, assert **`game-canvas`** on **`/game`**, assert **absence** of **`game-canvas`** on **`/`**, deep **`/briefcase`**, **`briefcase-seed-input`**, **`briefcase-backdrop`**, viewports

### Implementation for User Story 1

- [x] T012 [US1] Add English strings (home, game, briefcase, nav) in `src/constants/appCopy.ts` at repository root
- [x] T013 [P] [US1] Implement themed `src/components/briefcase/BriefcaseView.vue` (includes **seed** per **FR-010(d)**)
- [x] T014 [US1] Implement `src/views/briefcase/BriefcaseViewPage.vue` with **`briefcase-backdrop`** + **`BriefcaseView`** + `data-testid="nav-to-home"` → **`/`** (**FR-010(e)**)
- [x] T015 [US1] Update `src/views/home/HomeView.vue` with `data-testid="nav-to-briefcase"` → **`/briefcase`** and `data-testid="nav-to-game"` → **`/game`** (labels from `appCopy.ts`)
- [x] T016 [US1] Finalize `src/router/index.ts` and remove placeholders
- [x] T017 [US1] Run `pnpm test` and `pnpm test:e2e` (or `pnpm test:e2e:preview`) until **US1** shell is green

**Checkpoint**: **MVP shell** — nav, canvas routing, **seed**, **backdrop**, **FR-008** + **FR-009**, E2E green for shipped selectors.

---

## Phase 4: User Story 2 — Shared theme consistency (Priority: P2)

**Goal**: **FR-002** — repeated patterns and **nav** use same token roles.

**Independent Test**: Review + Vitest/E2E class assertions.

### Tests for User Story 2 (mandatory) ⚠️

- [x] T018 [P] [US2] Add `src/components/ui/AppButton.spec.ts` for shared nav link theme classes (supersedes optional `AppNavLink.spec.ts`)

### Implementation for User Story 2

- [x] T019 [US2] Extract `src/components/ui/AppButton.vue`, `src/components/ui/AppPanel.vue` (or similar) used by `HomeView`, `GameView`, `BriefcaseViewPage`, `BriefcaseView`
- [x] T020 [US2] Extend `e2e/briefcase-view.spec.ts` for shared theme class patterns on nav + Briefcase surfaces
- [x] T021 [US2] Add **theme rules** comment block in `src/style.css` or `src/theme/tokens.css` for **SC-004**

**Checkpoint**: US2 complete; US1 tests still green.

---

## Phase 5: Polish & cross-cutting concerns

- [ ] T022 [P] (Optional) Record **Stitch MCP** project/screen IDs in `specs/002-stitch-theme-briefcase/plan.md` **Design reference log** if using MCP—**FR-006** is already satisfied by cited **`designs/`** paths in **plan.md**
- [x] T023 Run `pnpm lint` at repository root
- [x] T024 Run manual checks in `specs/002-stitch-theme-briefcase/quickstart.md`

---

## Phase 6: User Story 1 — FR-010(a–c) Main Menu chrome parity (Priority: P1)

**Goal**: Ship **FR-010(a)** **three** **difficulty** **tiles** (radio group per **`code.html`**), **FR-010(b)** **glass-style** panel (frosted / translucent, distinct from solid `AppPanel`), **FR-010(c)** **Unlock showcase** control (**stub** OK)—all **English**, **visible**, **operable** per [spec.md](./spec.md) scenario **7** and [contracts/briefcase-view.e2e.schema.json](./contracts/briefcase-view.e2e.schema.json).

**Independent Test**: On **`/briefcase`**, user can change difficulty (client-visible state), see at least one **glass** region, click **Unlock showcase** without error; Playwright asserts stable **`data-testid`s**; Vitest covers labels and wiring.

### Tests for Phase 6 (mandatory) ⚠️

- [x] T025 [P] [US1] Extend failing-first Vitest `src/components/briefcase/BriefcaseView.spec.ts` for **difficulty** control (`data-testid="briefcase-difficulty"`), **glass** host (`data-testid="briefcase-glass-panel"` or agreed contract id), and **Unlock showcase** (`data-testid="briefcase-unlock-showcase"`) with English copy from `appCopy.ts`
- [x] T026 [P] [US1] Extend failing-first Playwright `e2e/briefcase-view.spec.ts` for **P1 scenario 7**: difficulty operable, **glass** panel visible, **Unlock showcase** visible + click; **prefers-reduced-motion** smoke on **backdrop** + chrome; keep scenarios **1–8** green

### Implementation for Phase 6

- [x] T027 [US1] Add **Main Menu** English strings in `src/constants/appCopy.ts` (e.g. difficulty option labels, section label if needed, **Unlock showcase** button label) at repository root
- [x] T028 [US1] Implement **difficulty** control with **`data-testid="briefcase-difficulty"`** and **client-side** `ref` state in `src/components/briefcase/BriefcaseView.vue` *(historical: shipped **`<select>`**; **Phase 8** **T037** replaces with **radio** **tiles** per **FR-010(a)**)*
- [x] T029 [US1] Implement **glass-style** treatment: extend `src/components/ui/AppPanel.vue` with optional **glass** variant **or** add `src/components/briefcase/BriefcaseGlassPanel.vue` using **`backdrop-blur`** + translucent background + **`data-testid="briefcase-glass-panel"`**; use on Briefcase main content per **FR-010(b)**
- [x] T030 [US1] Add **Unlock showcase** control (e.g. `AppButton` or `<button>`) with **`data-testid="briefcase-unlock-showcase"`** and **stub** handler (e.g. `console` or noop) in `src/components/briefcase/BriefcaseView.vue`
- [x] T031 [US1] Add **`briefcaseDifficultyTestId`**, **`briefcaseGlassPanelTestId`**, **`briefcaseUnlockShowcaseTestId`** to **`stableSelectors.required`** in `specs/002-stitch-theme-briefcase/contracts/briefcase-view.e2e.schema.json` with const values matching implementation
- [x] T032 [US1] Add any **glass** / frosted tokens or utilities to `src/style.css` **`@theme`** block if Tailwind arbitrary classes are insufficient for **SC-004** traceability
- [x] T033 [US1] Run `pnpm test`, `pnpm lint`, and `pnpm test:e2e:preview` at repository root until Phase 6 is green

**Checkpoint**: **FR-010** fully covered in app + contract + tests; ready for **SC-001** human pass vs Stitch.

---

## Phase 7: FR-002 — `designs/` export token parity (Priority: P1)

**Goal**: Map **`src/style.css`** and Briefcase shell components to **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/code.html`** (see **plan.md** token table).

- [x] T034 [P] [US1] Update **`src/style.css`** `:root` / **`@theme`** with export **primary**, **background-dark**, **glass** fill, **text-main**, **muted**, **border-glass**, **radii**, **noise** utility; update **`BriefcaseViewPage.vue`** ambient glows + noise layer; **`BriefcaseGlassPanel.vue`** export **glass-panel** shadow/blur; **`BriefcaseView.vue`** inputs + CTA; **`AppButton.vue`** glass-style nav treatment; run **`pnpm test`**, **`pnpm lint`**, **`pnpm test:e2e:preview`**

---

## Phase 8: FR-010(a) — Difficulty **radio tiles** (spec + `code.html`) (Priority: P1)

**Goal**: Remove **`<select>`**; ship **three** **tile**-style **`input type="radio"`** options (**Easy** / **Medium** / **Hard**) with **`data-testid="briefcase-difficulty"`** on the **`fieldset`** (or single radiogroup root), **`legend`** (or **`aria-labelledby`**) for the section title, **keyboard**-operable radios, and **layout** / **selected-state** styling aligned to **`designs/stitch_gablota_kolekcjonera_premium_glassmorphism_prd/the_briefcase_main_menu/code.html`** (`.radio-card`, `grid grid-cols-1 md:grid-cols-3 gap-3`, **border-glass**, **bg-white/5**, **primary** accent when checked).

**Independent Test**: Vitest: **no** `<select>` under **`[data-testid="briefcase-difficulty"]`**; **three** radios with values **`easy`** / **`medium`** / **`hard`**; **legend** visible. Playwright: user can select **Hard** via **radio** (not `selectOption`); **`pnpm test`**, **`pnpm lint`**, **`pnpm test:e2e:preview`** green.

### Tests for Phase 8 (mandatory) ⚠️

> Prefer **red-first**: adjust tests to expect **radios**, confirm **FAIL** on current `<select>` build, then implement **T037**.

- [ ] T035 [P] [US1] Rewrite **`src/components/briefcase/BriefcaseView.spec.ts`** **FR-010(a)** expectations: wrapper **`[data-testid="briefcase-difficulty"]`** is a **`fieldset`** (or element with **`role="radiogroup"`**); contains **`legend`** (or labelled radiogroup) with **`briefcaseDifficultyLabel`** text; **exactly three** **`input[type="radio"]`** with **`name`** shared and values **`easy`**, **`medium`**, **`hard`**; **zero** **`select`**; assert **click** / **`setValue`** on a radio updates **`checked`** and **`v-model`** state (**medium** default acceptable); keep **glass** + **Unlock showcase** assertions green
- [ ] T036 [P] [US1] Rewrite **`e2e/briefcase-view.spec.ts`** difficulty step: **do not** call **`selectOption`** on **`briefcase-difficulty`**; use **`getByRole('radio', { name: … })`** (or scoped locator under **`getByTestId('briefcase-difficulty')`**) to click **Hard** (use **`briefcaseDifficultyHard`** copy from contract English rules); assert **Hard** is **checked** (`toBeChecked()`); keep **P1 scenarios 1–8** and **prefers-reduced-motion** smoke green

### Implementation for Phase 8

- [ ] T037 [US1] Replace **`<select>`** block in **`src/components/briefcase/BriefcaseView.vue`** with **`code.html`**-style **radio tiles**: **`fieldset`** + **`legend`** + **`data-testid="briefcase-difficulty"`** on **`fieldset`**; each option = **`label`** wrapping **`input.sr-only.peer`** + card **`div`**; bind **`v-model`** to **`difficulty`** ref; **selected** tile uses **primary** border/ring/bg per export (**`peer-checked:`** on sibling card or equivalent); responsive **grid** **`grid-cols-1 md:grid-cols-3 gap-3`**; extend **`src/constants/appCopy.ts`** with optional **mono** subtitle lines for each tier (e.g. **4×4 Grid**, **6×6 Grid**, **8×8 Grid**) matching export **or** product-approved English
- [ ] T038 [US1] Run **`pnpm test`**, **`pnpm lint`**, and **`pnpm test:e2e:preview`** at repository root until **Phase 8** is green

**Checkpoint**: **FR-010(a)** matches **spec** + **contract** (**`briefcase-difficulty`** = radiogroup host); ready for **SC-001** tile row vs **`screen.png`**.

---

## Dependencies & execution order

- **Phase 1** → **Phase 2** → **Phase 3 (US1 shell)** → **Phase 4 (US2)** → **Phase 5** → **Phase 6 (US1 FR-010 a–c)** → **Phase 7 (FR-002 parity)** → **Phase 8 (FR-010(a) radio tiles)**
- **Phase 6** depends on Phase 3 checkpoint (Briefcase route and test harness exist)
- **Phase 8** depends on Phase 7 (theme tokens stable); may start **T035**/**T036** in parallel before **T037**

### Parallel opportunities

- **T025** + **T026** after Phase 5
- **T028** + **T029** + **T030** if coordinated to avoid merge conflicts in `BriefcaseView.vue` (otherwise sequential)
- **T035** + **T036** in parallel before **T037**; **T038** after **T037**

---

## Parallel example: Phase 6

```bash
# After T027 copy exists:
# - src/components/briefcase/BriefcaseView.spec.ts
# - e2e/briefcase-view.spec.ts
```

## Parallel example: Phase 8

```bash
# Red-first: land T035 + T036 (expect FAIL on <select>), then T037, then T038.
# - src/components/briefcase/BriefcaseView.spec.ts
# - e2e/briefcase-view.spec.ts
```

---

## Implementation strategy

### MVP (historical)

1. Phases 1–2  
2. **T010–T017** tests-first  
3. Phases 4–5

### Current focus

1. **Phase 8** — **T035** → **T036** → **T037** → **T038** (radio **tiles** + tests).  
2. **SC-001** side-by-side review vs **`designs/.../the_briefcase_main_menu/screen.png`** (human).  
3. **T022** (optional) — Stitch MCP IDs in **plan.md** if desired.

---

## Notes

- Contract: `routes.home` `/`, `routes.game` `/game`, `routes.briefcase` `/briefcase`; testids `nav-to-briefcase`, `nav-to-home`, `nav-to-game`, `game-canvas`, `briefcase-view`, `briefcase-seed-input`, `briefcase-backdrop`, **`briefcase-difficulty`** (**fieldset** / **radiogroup** host after **Phase 8**), `briefcase-glass-panel`, `briefcase-unlock-showcase`
- **Total tasks**: **38** (T001–T038); **open**: **T035–T038** (**Phase 8**); **1** optional: **T022** (Stitch MCP IDs only)
