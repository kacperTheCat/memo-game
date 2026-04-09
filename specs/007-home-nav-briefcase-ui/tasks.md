# Tasks: Home & Navigation Layout Alignment

**Input**: Design documents from `/specs/007-home-nav-briefcase-ui/`  
**Prerequisites**: [`plan.md`](./plan.md), [`spec.md`](./spec.md), [`research.md`](./research.md), [`data-model.md`](./data-model.md), [`contracts/README.md`](./contracts/README.md), [`quickstart.md`](./quickstart.md)

**Tests (mandatory for this repository)**: Every user story includes failing-first **Vitest** and **Playwright** tasks per `.specify/memory/constitution.md`.

**Organization**: Phases follow user story priority (P1–P4); **MVP = User Story 1** after Setup + Foundational. **Phase 8+** tracks **spec Clarifications 2026-04-08** (real icons, primary **Configure New Game**, debrief-as-bar grain).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no ordering dependency within the same checkpoint)
- **[Story]**: `[US1]` … `[US4]` for user-story phases only
- Descriptions include concrete file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align on scope and copy before code changes.

- [x] T001 Review current implementation against [`spec.md`](./spec.md) in `src/views/game/GameView.vue`, `src/views/home/HomeView.vue`, `src/views/briefcase/BriefcaseViewPage.vue`, `src/components/briefcase/BriefcaseView.vue`, `src/components/game/WinDebriefPanel.vue`
- [x] T002 [P] Add English strings for new navigation labels (Return to Start Screen, Configure New Game, Return to Game, Return to Briefcase / Abandon labels as needed) in `src/constants/appCopy.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared UI primitives used by **US1–US4**. **No user story implementation until this checkpoint passes.**

**⚠️ CRITICAL**: Completes before **Phase 3+** user story work in this file.

- [x] T003 [P] Failing-first Vitest: `src/components/ui/MemoSecondaryNavButton.spec.ts` — `back` vs `dismiss` variants, click / `to` navigation props
- [x] T004 [P] Failing-first Vitest: `src/components/game/SessionHistoryLedger.spec.ts` — empty state vs rows (props or mocked `useGameSessionStore`)
- [x] T005 Implement `src/components/ui/MemoSecondaryNavButton.vue` (Tailwind classes aligned with `src/components/game/WinDebriefPanel.vue` header button)
- [x] T006 Refactor `src/components/game/WinDebriefPanel.vue` header **Return to Briefcase** to use `MemoSecondaryNavButton.vue` (preserve `data-testid="win-return-briefcase"` behavior)
- [x] T007 Extract `src/components/game/SessionHistoryLedger.vue` from ledger table markup in `src/components/game/WinDebriefPanel.vue`; integrate so debrief uses the shared component (canonical `data-testid="session-history-table"` per `specs/007-home-nav-briefcase-ui/contracts/README.md`)
- [x] T008 Run `pnpm test` and fix until Vitest is green for T003–T004 and any new component specs

**Checkpoint**: Foundational ready — user story work may start (US1 can use T005; US2 needs T007).

---

## Phase 3: User Story 1 — Minimal chrome during active play (Priority: P1) 🎯 MVP

**Goal**: On **in-progress** `/game` (not debrief), show only **Return to Briefcase** (left) and **Abandon Game** (right, dismiss family); remove other top chrome; persist session on return.

**Independent Test**: Start a match → only two controls → Return to Briefcase preserves resume → Abandon clears resume and lands on `/briefcase`.

### Tests for User Story 1 (mandatory) ⚠️

> Write **before** implementation; ensure **red** first.

- [x] T009 [P] [US1] Playwright: `e2e/game-view-chrome.spec.ts` — two `data-testid`s, no legacy `nav-to-home` / heading copy in active-play chrome (maps to spec US1 scenarios 1–3)
- [x] T010 [P] [US1] Vitest: `src/views/game/GameView.activeNav.spec.ts` (or `src/composables/useReturnToBriefcaseDuringPlay.spec.ts`) — asserts `flushSave` + `router.push` briefcase without `clearSession` when stubbing Pinia/router

### Implementation for User Story 1

- [x] T011 [US1] Replace active-play header in `src/views/game/GameView.vue` with flex row: `MemoSecondaryNavButton` **Return to Briefcase** (`data-testid="game-return-briefcase"`) calling `session.flushSave(play.memory)` then `router.push({ name: 'briefcase' })`
- [x] T012 [US1] Add right-aligned **Abandon Game** (`dismiss` variant, keep `data-testid="game-abandon-game"`) reusing existing `finalizeSession` / reset / `router.push` flow in `src/views/game/GameView.vue`
- [x] T013 [US1] Remove `gamePageHeading`, `gamePageSubline`, and `AppButton` **Home** nav from active-play branch; keep `storageError` **outside** the two-control row per `specs/007-home-nav-briefcase-ui/plan.md`

**Checkpoint**: US1 green — `pnpm exec playwright test e2e/game-view-chrome.spec.ts` + relevant Vitest

---

## Phase 4: User Story 2 — Home hub ledger + actions (Priority: P2)

**Goal**: `/` shows grain/navy shell, **Configure New Game** (primary gold per clarifications) + conditional **Return to Game** (secondary), and **SessionHistoryLedger**; remove legacy marketing block.

**Independent Test**: `/` with/without in-progress session → table + CTA visibility per spec.

### Tests for User Story 2 (mandatory) ⚠️

- [x] T014 [P] [US2] Playwright: `e2e/home-hub-layout.spec.ts` — ledger table/empty, `home-configure-game`, conditional `home-return-game` (maps to spec US2)
- [x] T015 [P] [US2] Vitest: `src/views/home/HomeView.spec.ts` — conditional rendering of **Return to Game** when session `in_progress`

### Implementation for User Story 2

- [x] T016 [US2] Rebuild `src/views/home/HomeView.vue`: backdrop wrapper with `HubGrainLayer`, top action row, embed `SessionHistoryLedger.vue`
- [x] T017 [US2] Wire **Configure New Game** → `/briefcase` and **Return to Game** → `/game` (resume path per [`research.md`](./research.md) §3) in `src/views/home/HomeView.vue`

**Checkpoint**: US2 green — `pnpm exec playwright test e2e/home-hub-layout.spec.ts` + HomeView Vitest

---

## Phase 5: User Story 3 — Briefcase hub navigation (Priority: P3)

**Goal**: **Return to Start Screen** (back icon family) + conditional **Return to Game**; remove `AppButton` hub row from page wrapper.

**Independent Test**: `/briefcase` with/without in-progress → controls and destinations.

### Tests for User Story 3 (mandatory) ⚠️

- [x] T018 [P] [US3] Update Playwright `e2e/briefcase-view.spec.ts` — replace legacy `nav-to-home` / `nav-to-game` **AppButton** expectations with `briefcase-return-home` / `briefcase-return-game` (maps to spec US3)
- [x] T019 [P] [US3] Vitest: `src/components/briefcase/BriefcaseView.spec.ts` — nav visibility vs session state

### Implementation for User Story 3

- [x] T020 [US3] Add top hub nav row to `src/components/briefcase/BriefcaseView.vue` using `MemoSecondaryNavButton` (**Return to Start Screen** → `/`, **Return to Game** when `in_progress`, right of home)
- [x] T021 [US3] Remove duplicate nav `AppButton` block from `src/views/briefcase/BriefcaseViewPage.vue` (keep `data-testid="briefcase-backdrop"` and layout wrapper)
- [x] T022 [US3] Expose **resume-only** navigation (`resumeToGame()` in `src/composables/game/useBriefcaseNavigateToGame.ts`) and wire **Return to Game** on briefcase + home
- [x] T023 [US3] Run `pnpm exec playwright test e2e/briefcase-view.spec.ts` and relevant Vitest until User Story 3 is green

**Checkpoint**: US3 complete at **T023**

---

## Phase 6: User Story 4 — Home & briefcase grain atmosphere (Priority: P4)

**Goal**: **Navy/black** base + **SVG noise** on home and briefcase; **post-match debrief** grain is the **reference bar** (see spec clarifications + [`research.md`](./research.md) §6).

**Independent Test**: Visual + legible text; Playwright **must** see `data-testid="hub-grain-layer"` on **`/`** and **`/briefcase`**.

### Tests for User Story 4 (mandatory) ⚠️

- [x] T024 [P] [US4] Extend `e2e/home-hub-layout.spec.ts` and/or `e2e/briefcase-view.spec.ts` — **require** `getByTestId('hub-grain-layer')` **visible** on **`/`** and on **`/briefcase`** (maps to spec US4 scenario 1)

### Implementation for User Story 4

- [x] T025 [US4] Add `src/components/layout/HubGrainLayer.vue` (grain + vignette) with **`data-testid="hub-grain-layer"`**, modeled on debrief noise patterns with **cool** navy palette per Stitch briefcase reference
- [x] T026 [US4] Apply shared backdrop via `HubGrainLayer` in `src/views/home/HomeView.vue` and `src/views/briefcase/BriefcaseViewPage.vue`; verify contrast for `BriefcaseGlassPanel` and home table

**Checkpoint**: US4 — relevant Playwright green; manual check vs Stitch PNG

---

## Phase 7: Polish & Cross-Cutting Concerns (baseline)

**Purpose**: Contract alignment, full suite, manual quickstart.

- [x] T027 [P] Sync final `data-testid` strings with `specs/007-home-nav-briefcase-ui/contracts/README.md` across `src/components/**/*.vue` and `e2e/**/*.spec.ts`
- [x] T028 [P] Run `pnpm test` and `pnpm test:e2e:preview` from repo root; fix regressions (including `e2e/win-game-screen.spec.ts` if selectors drift)
- [x] T029 Execute manual scenarios in `specs/007-home-nav-briefcase-ui/quickstart.md`

---

## Phase 8: Clarification follow-up — Real nav icons (FR-004)

**Goal**: Replace ASCII / single-character glyphs in secondary nav with **real SVG graphics**; document license (prefer `designs/` or `src/assets/icons` + README).

**Independent Test**: Vitest on `MemoSecondaryNavButton` + visual spot-check; no literal `<` or `X` as the only icon graphic.

### Tests (mandatory) ⚠️

- [x] T030 [P] Update failing-first expectations in `src/components/ui/MemoSecondaryNavButton.spec.ts` — assert **SVG** (or `<svg>` in HTML) for `back` and `dismiss`, not text node `<` / `X` as sole affordance

### Implementation

- [x] T031 [P] Add icon assets: e.g. `src/assets/icons/NavBackIcon.vue` and `src/assets/icons/NavDismissIcon.vue` (inline SVG, MIT-compatible paths) **or** equivalent under `public/icons/`; add `designs/README.md` **or** `src/assets/icons/README.md` with **license / source** if copied from Heroicons, Lucide, etc.
- [x] T032 Wire icons into `src/components/ui/MemoSecondaryNavButton.vue` with **`aria-hidden="true"`** on decorative graphics; preserve visible **English** labels
- [x] T033 [US1] Re-run `pnpm exec vitest run src/components/ui/MemoSecondaryNavButton.spec.ts` and spot-check `src/views/game/GameView.vue`, `src/components/game/WinDebriefPanel.vue`, `src/views/home/HomeView.vue`, `src/components/briefcase/BriefcaseView.vue` nav rows

**Checkpoint**: MemoSecondaryNavButton spec green; icons visible in browser on `/game`, `/`, `/briefcase`, debrief

---

## Phase 9: Clarification follow-up — Configure New Game primary CTA (FR-007)

**Goal**: **Configure New Game** on **`/`** uses **primary gold** styling (same family as debrief **Play Again**); **Return to Game** stays secondary.

**Independent Test**: Home Vitest + Playwright distinguish primary vs secondary control styling or roles.

### Tests (mandatory) ⚠️

- [x] T034 [P] [US2] Extend `src/views/home/HomeView.spec.ts` — **Configure New Game** control uses primary accent classes or dedicated `data-testid` + class contract (e.g. `bg-memo-accent` / `memo-cta`)
- [x] T035 [P] [US2] Extend `e2e/home-hub-layout.spec.ts` — assert **Configure New Game** (`home-configure-game`) has **primary** gold treatment vs **Return to Game** (`home-return-game`) **secondary** treatment (e.g. `toHaveClass` on expected Tailwind tokens)

### Implementation

- [x] T036 [US2] Refactor `src/views/home/HomeView.vue` so **Configure New Game** is **not** `MemoSecondaryNavButton`; use `RouterLink` or shared primary button pattern matching `WinDebriefPanel` **Play Again** / `memo-accent` tokens

**Checkpoint**: US2 tests green; Configure reads as gold CTA per spec

---

## Phase 10: Clarification follow-up — Grain parity with debrief (FR-009)

**Goal**: Tune **`HubGrainLayer`** so grain **strength** aligns with **`WinDebriefPanel`** `.noise-bg` reference (design review: home/briefcase not **weaker** than debrief).

**Independent Test**: Manual side-by-side per `quickstart.md`; optional Playwright visibility-only (already T024).

### Implementation

- [x] T037 [US4] Adjust opacity / `mix-blend-mode` / SVG `feTurbulence` parameters in `src/components/layout/HubGrainLayer.vue` (and, if needed, shared CSS variables in `src/style.css`) using `src/components/game/WinDebriefPanel.vue` as the **reference bar**
- [x] T038 [P] Update `specs/007-home-nav-briefcase-ui/quickstart.md` **Design spot-check** with explicit **debrief vs home vs briefcase** grain comparison step (sign-off note for reviewers)

**Checkpoint**: Design review satisfied per **SC-004** grain clause

---

## Phase 11: Polish after clarifications

- [x] T039 [P] Run `pnpm test` and `pnpm test:e2e:preview`; fix any selector or class regressions from T030–T038
- [x] T040 Re-run full manual checklist in `specs/007-home-nav-briefcase-ui/quickstart.md` including icon + CTA + grain items

---

## Phase 12: Material Symbols nav (spec / plan update — FR-004, FR-007, FR-008)

**Goal**: Replace inline SVG nav icons (**T031–T032**) with **Google Material Symbols Outlined** per [`spec.md`](./spec.md) clarifications and [`plan.md`](./plan.md): **`arrow_back`** + **`group-hover:-translate-x-1`**; **`arrow_forward`** + **`group-hover:translate-x-1`** for **Return to Game**; **`close`** for **Abandon**; root control **`group`**.

**Independent Test**: Vitest asserts `.material-symbols-outlined` + ligature text; Playwright smoke on `/game`, `/`, `/briefcase`.

### Tests (mandatory) ⚠️

- [x] T041 [P] Rewrite `src/components/ui/MemoSecondaryNavButton.spec.ts` — for **`back`**, **`forward`**, **`dismiss`**: expect `<span class="material-symbols-outlined">` containing **`arrow_back`**, **`arrow_forward`**, **`close`** respectively; expect root **`group`** class; expect **`translate-x-1`** / **`-translate-x-1`** on icon span classes as per [`research.md`](./research.md) §5

### Implementation

- [x] T042 Add **Material Symbols Outlined** stylesheet to `index.html` (Google Fonts URL with **`display=swap`**, opsz/wght per [`research.md`](./research.md) §5)
- [x] T043 Refactor `src/components/ui/MemoSecondaryNavButton.vue`: extend **`variant`** to **`'back' | 'forward' | 'dismiss'`**; render Material spans ( **`aria-hidden="true"`** ); apply **`group`** on **RouterLink** / **button**; remove **`NavBackIcon` / `NavDismissIcon`** imports
- [x] T044 [US2] Set **`variant="forward"`** on **Return to Game** `MemoSecondaryNavButton` in `src/views/home/HomeView.vue` (keep **`to`** / **`data-testid="home-return-game"`**)
- [x] T045 [US3] Set **`variant="forward"`** on **Return to Game** in `src/components/briefcase/BriefcaseView.vue` (**`data-testid="briefcase-return-game"`**)
- [x] T046 [US1] Verify `src/views/game/GameView.vue` (**Return to Briefcase** = **`back`**, **Abandon** = **`dismiss`**) and `src/components/game/WinDebriefPanel.vue` (**Return to Briefcase** = **`back`**) use updated component; **`Return to Start Screen`** in Briefcase stays **`back`**
- [x] T047 [P] Remove unused `src/assets/icons/NavBackIcon.vue`, `NavDismissIcon.vue` **or** mark deprecated in `src/assets/icons/README.md`; delete if nothing imports them
- [x] T048 [P] Run `pnpm test` and `pnpm exec playwright test e2e/game-view-chrome.spec.ts e2e/home-hub-layout.spec.ts e2e/briefcase-view.spec.ts` (or full `pnpm test:e2e:preview`); fix regressions

**Checkpoint**: Phase 12 green — Material glyphs + motion match **FR-004** / **FR-007** / **FR-008**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phases 3–7 (US1–US4 baseline)** → **Phase 7**  
- **Phase 8–11** depend on baseline complete; **Phase 8** (icons) can parallel **Phase 9** (CTA) in separate files until **T033** / **T036** full-browser pass
- **Phase 10** may follow **Phase 8–9** or run in parallel if only CSS files touched
- **Phase 12** depends on **Phase 8** complete (replaces SVG icon delivery with **Material Symbols**); run **T041** before **T043**; **T044–T046** after **T043**

### User Story Dependencies

| Story | Depends on | Independently testable after |
|-------|------------|------------------------------|
| US1 | Phase 2 | T013 (+ T033 after icons) |
| US2 | Phase 2 (ledger) | T017 (+ T036 after CTA) |
| US3 | Phase 2 (button) + resume API | T023 (+ T033) |
| US4 | US2 + US3 surfaces | T026 (+ T037) |

### Parallel Opportunities

- **Phase 8**: T030 ∥ T031; then T032 → T033  
- **Phase 9**: T034 ∥ T035; then T036  
- **Phase 10**: T037 ∥ T038 (docs) with coordination  
- **Phase 11**: T039 ∥ partial retests

### Parallel Example: Clarification tranche

```bash
pnpm exec vitest run src/components/ui/MemoSecondaryNavButton.spec.ts
pnpm exec vitest run src/views/home/HomeView.spec.ts
```

### Parallel Example: Phase 12 (Material)

```bash
pnpm exec vitest run src/components/ui/MemoSecondaryNavButton.spec.ts
# after T043:
pnpm exec playwright test e2e/game-view-chrome.spec.ts e2e/home-hub-layout.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1–2  
2. Complete Phase 3 (US1)  
3. Stop and validate: `e2e/game-view-chrome.spec.ts` + Vitest  

### Incremental Delivery

1. Baseline **Phases 1–7** (historically complete)  
2. **Phase 8** — real icons (cross-cutting)  
3. **Phase 9** — Configure primary CTA  
4. **Phase 10** — grain parity tuning  
5. **Phase 11** — regression + manual sign-off  
6. **Phase 12** — **Material Symbols** + **`forward`** variant (**T041–T048**)

---

## Task Summary

| Metric | Value |
|--------|-------|
| **Total task IDs** | **T001–T048** |
| **Completed** | T001–T048 (`[x]`) |
| **Open** | — |
| **US1** | T009–T013; Phase 12: **T046**, **T048** |
| **US2** | T014–T017, T034–T036; Phase 12: **T044**, **T041**, **T048** |
| **US3** | T018–T023; Phase 12: **T045**, **T048** |
| **US4** | T024–T026, T037–T038 |

**Format validation**: Every line uses `- [ ]` or `- [x]`, sequential **T###** IDs, file paths in descriptions, **[Story]** on user-story tasks, **[P]** only where parallel-safe.

---

## Notes

- **TDD**: Write **T041** red before **T043**; historically **T030**, **T034**, **T035** before their phases.  
- **Phase 8 (T030–T033)** delivered **SVG** icons; **Phase 12** supersedes nav delivery with **Material Symbols** per latest **spec** / **plan** (keep **T031** assets only if still referenced elsewhere).  
- **FR-014**: `src/router/index.ts` **won-only** debrief clear on `/briefcase` unchanged.  
- **Resume**: **Return to Game** must **not** trigger `useBriefcaseNavigateToGame` abandon confirm ([`research.md`](./research.md) §3).  
- **Contracts**: Canonical ledger testid **`session-history-table`** ([`contracts/README.md`](./contracts/README.md)).
