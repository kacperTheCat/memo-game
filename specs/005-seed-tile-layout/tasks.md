---
description: "Task list for feature 005 — Deterministic game seed (Briefcase)"
---

# Tasks: Deterministic game seed (Briefcase)

**Input**: Design documents from `/specs/005-seed-tile-layout/`  
**Prerequisites**: [`plan.md`](./plan.md), [`spec.md`](./spec.md), [`data-model.md`](./data-model.md), [`research.md`](./research.md), [`contracts/`](./contracts/), [`quickstart.md`](./quickstart.md)

**Tests (mandatory for this repository)**: Failing-first **Vitest** and **Playwright** per `.specify/memory/constitution.md`. **`e2e/briefcase-seed-layout.spec.ts`** maps to US1–US3 in [`spec.md`](./spec.md).

**Status**: **T001–T035** done in tree (**FR-005a**, **FR-006a**, automated tests). **T036** is a manual **`quickstart.md`** §**3b** pass (run locally when validating Briefcase UX).

**Organization**: Setup → Foundational parse → US1 → US2 → US3 → Polish → **Post-clarification**. Stateless dealing: **`rngForDealInit`** + **`history.state.memoDealInit`** ([`data-model.md`](./data-model.md)).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallel-safe (different files, no ordering dependency on sibling [P] tasks)
- **[Story]**: `[US1]` / `[US2]` / `[US3]` on user-story phases only
- Each description names at least one **file path**

## Path Conventions

Single repo: root `package.json`; `src/` Vue app; Vitest `src/**/*.spec.ts`; Playwright `e2e/`.

---

## Phase 1: Setup (shared)

**Purpose**: Single Briefcase seed field for Unlock and header Play.

- [x] T001 Add `briefcaseSeedRaw: string` (default `''`) to `src/stores/gameSettings.ts` and wire `src/components/briefcase/BriefcaseView.vue` seed input to read/write this field so both navigation buttons see the same value

---

## Phase 2: Foundational (blocking)

**Purpose**: Pure parser **`seedNine | null`**. Blocks US1–US3 until complete.

- [x] T002 Add `parseNineDigitSeedOrNull(raw: string): string | null` in `src/game/seedDeal.ts` per `specs/005-seed-tile-layout/contracts/seed-deal.contract.md` (strip non-digits; exactly **9** digits ⇒ return; else **`null`**)

**Checkpoint**: Parser covered by US2 Vitest; RNG wiring in US1.

---

## Phase 3: User Story 1 — Reproducible deal (P1) — MVP

**Goal**: Same **9-digit** seed + **difficulty** ⇒ identical initial `identityIndex` permutation; [`spec.md`](./spec.md) US1 / FR-003.

**Independent Test**: `pnpm test` → `src/game/seedDeal.spec.ts`; `pnpm run test:e2e:preview` → US1 block in `e2e/briefcase-seed-layout.spec.ts` + `data-testid` hooks on `src/components/GameCanvasShell.vue`.

### Tests for User Story 1 (mandatory)

- [x] T003 [P] [US1] Vitest `src/game/seedDeal.spec.ts` for `hashSeedKey` / `mulberry32` / `dealKey` / `createSeededRngForDeal` + golden `identityIndex[]` for three `(nineDigits, difficulty)` pairs per `specs/005-seed-tile-layout/contracts/seed-deal.contract.md` (use `shuffleIdentities` from `src/game/memoryEngine.ts` + `buildGridCells` from `src/game/buildGridLayout.ts` + `src/data/tile-library.json`)
- [x] T004 [P] [US1] Playwright `e2e/briefcase-seed-layout.spec.ts` `test.describe('US1 reproducible deal')`: nine digits, `/game`, stable `data-testid="game-initial-identities"` across two navigations

### Implementation for User Story 1

- [x] T005 [US1] Implement `src/game/seedDeal.ts` (`hashSeedKey`, `mulberry32`, `dealKey`, `createSeededRngForDeal`, `rngForDealInit`) per `specs/005-seed-tile-layout/research.md` until `src/game/seedDeal.spec.ts` passes
- [x] T006 [US1] Update `src/composables/useBriefcaseNavigateToGame.ts` to `router.push({ name: 'game', state: { memoDealInit: { seedNine: parseNineDigitSeedOrNull(settings.briefcaseSeedRaw) } } })` so `src/views/BriefcaseViewPage.vue` and `src/components/briefcase/BriefcaseView.vue` share the path
- [x] T007 [US1] Update `src/components/GameCanvasShell.vue` `initRoundIfNeeded`: new deal reads `memoDealInit.seedNine` once, `play.startNewRound(layout, rngForDealInit(...))`, clears state via `router.replace`; snapshot hydrate ignores `memoDealInit`
- [x] T008 [US1] No duplicate seed handling in `src/components/briefcase/BriefcaseView.vue` beyond `briefcaseSeedRaw` sync
- [x] T009 [US1] On `src/components/GameCanvasShell.vue`, expose `data-testid="game-initial-identities"` and `data-deal-init="seeded" | "random"`
- [x] T010 [US1] US1 Playwright green; golden table in `specs/005-seed-tile-layout/contracts/seed-deal.contract.md` matches Vitest

---

## Phase 4: User Story 2 — Optional / partial seed (P2)

**Goal**: Incomplete seed ⇒ `null` ⇒ `Math.random`; restore ignores `memoDealInit`. [`spec.md`](./spec.md) US2.

**Independent Test**: Vitest `parseNineDigitSeedOrNull`; Playwright US2 asserts `data-deal-init="random"`.

### Tests for User Story 2 (mandatory)

- [x] T011 [P] [US2] Vitest `src/game/seedDeal.spec.ts` for `parseNineDigitSeedOrNull` edge cases (empty, partial, masked, leading zeros, invalid chars)
- [x] T012 [P] [US2] Playwright `e2e/briefcase-seed-layout.spec.ts` `test.describe('US2 optional / partial seed')` for `data-deal-init="random"`

### Implementation for User Story 2

- [x] T013 [US2] `useBriefcaseNavigateToGame` always passes parsed `seedNine` (empty/partial ⇒ `null`)
- [x] T014 [US2] Vitest `src/game/dealInitFromNavigation.spec.ts` for snapshot path ⇒ `Math.random`, no `memoDealInit` read
- [x] T015 [US2] `src/views/GameView.vue` Abandon path uses default RNG (no `memoDealInit`)
- [x] T016 [US2] Win → `startNewRound` in `src/components/GameCanvasShell.vue` uses `Math.random` only

---

## Phase 5: User Story 3 — Mask (P3)

**Goal**: `xxx-xxx-xxx` mask; [`spec.md`](./spec.md) US3 / FR-001 / FR-005 (**FR-005a** extended in Phase 7).

**Independent Test**: `src/components/briefcase/BriefcaseView.spec.ts`; Playwright US3 block.

### Tests for User Story 3 (mandatory)

- [x] T017 [P] [US3] Vitest `src/components/briefcase/BriefcaseView.spec.ts` for mask, letters, paste, leading zeros
- [x] T018 [P] [US3] Playwright `e2e/briefcase-seed-layout.spec.ts` `test.describe('US3 mask')`

### Implementation for User Story 3

- [x] T019 [US3] `src/composables/useNineDigitSeedMask.ts` + `src/components/briefcase/BriefcaseView.vue` (`inputmode="numeric"`, `data-testid="briefcase-seed-input"`)
- [x] T020 [US3] `briefcaseSeedRaw` only Briefcase→nav source; `parseNineDigitSeedOrNull` in `useBriefcaseNavigateToGame`
- [x] T021 [US3] `src/constants/appCopy.ts` placeholder / copy as needed

---

## Phase 6: Polish & cross-cutting

- [x] T022 [P] Golden rows in `specs/005-seed-tile-layout/contracts/seed-deal.contract.md` match `src/game/seedDeal.spec.ts`
- [x] T023 [P] `e2e/briefcase-view.spec.ts` + `src/components/briefcase/BriefcaseView.spec.ts` aligned with mask
- [x] T024 Manual `specs/005-seed-tile-layout/quickstart.md` (rerun §1–§4 after Phase 7 for §3b)

---

## Phase 7: Post-clarification — FR-005a & FR-006a (2026-04-08)

**Purpose**: [**spec.md** Clarifications / **plan.md**] — (1) **Impossible to exceed nine digits** (typing + paste). (2) **`dealBriefcaseSeedRaw`** on **`GameSession`**; Briefcase→`/game` confirms abandon when **`briefcaseSeedRaw`** differs from session snapshot, **same UX as FR-014** difficulty mismatch.

**Independent Test**: Vitest for mask + navigate guard; Playwright for tenth digit + (optional) seeded abandon flow.

### Tests (write first; expect red until implementation)

- [x] T025 [P] Vitest `src/composables/useNineDigitSeedMask.spec.ts` for **`formatMaskedNineDigitsFromRawInput`**: nine digits then extra digits **do not** lengthen canonical digit run; long digit-only paste ⇒ first nine only (**FR-005a** / **SC-003**)
- [x] T026 [P] Vitest `src/components/briefcase/BriefcaseView.spec.ts` (or dedicated `src/composables/useBriefcaseNavigateToGame.spec.ts` if extracted): **`in_progress`** session with **`dealBriefcaseSeedRaw`** **`'111-111-111'`**, settings **`'222-222-222'`**, **`navigateToGame`** triggers **`window.confirm`** and does not **`router.push`** until confirm; on confirm, finalize + reset + push (mock **`window.confirm`** + router)

### Implementation

- [x] T027 Add **`dealBriefcaseSeedRaw: string`** to **`GameSession`** in **`src/game/memoryTypes.ts`** per **`specs/005-seed-tile-layout/data-model.md`**
- [x] T028 Extend **`beginSession`** in **`src/stores/gameSession.ts`** to set **`dealBriefcaseSeedRaw`** (parameter or options object; default **`''`** for direct **`/game`** / win continuation)
- [x] T029 **`src/components/GameCanvasShell.vue`**: pass **`settings.briefcaseSeedRaw`** into **`beginSession`** when starting a **new** deal from the **`briefcase-navigation`** path (lines ~292–308); pass **`''`** for **win** → **`beginSession`** and any path **without** Briefcase context per data-model
- [x] T030 **`src/views/GameView.vue`**: **`beginSession`** after Abandon uses **`dealBriefcaseSeedRaw: ''`**
- [x] T031 **`session.restoreFromSnapshot`** / hydrate path: legacy snapshots missing **`dealBriefcaseSeedRaw`** ⇒ normalize to **`''`** (in **`src/stores/gameSession.ts`** or **`GameCanvasShell.vue`**)
- [x] T032 **`src/composables/useBriefcaseNavigateToGame.ts`**: if **`gs?.status === 'in_progress'`** and **`settings.briefcaseSeedRaw !== gs.dealBriefcaseSeedRaw`**, run same finalize/reset as difficulty mismatch (**FR-006a**); add or reuse English copy in **`src/constants/appCopy.ts`**
- [x] T033 Update **`src/stores/gameSession.spec.ts`** (and any **`BriefcaseView.spec.ts`** **`beginSession`** stubs) for new **`GameSession`** field and **`beginSession`** signature

### Playwright & manual

- [x] T034 [P] **`e2e/briefcase-seed-layout.spec.ts`**: after nine digits typed, a **tenth** keystroke leaves **`briefcase-seed-input`** value **unchanged**
- [x] T035 [P] **`e2e/briefcase-seed-layout.spec.ts`**: **FR-006a** — seed **`/game`** from Briefcase with **in-progress** snapshot whose stored **`dealBriefcaseSeedRaw`** differs from current field ⇒ **confirm** appears; accept ⇒ navigates to **`/game`** with new deal (seed **`localStorage`** fixture or documented steps in spec comment if too brittle)
- [ ] T036 Re-run **`specs/005-seed-tile-layout/quickstart.md`** §**3b** manually after T032–T035 green

**Checkpoint**: **FR-005a** + **FR-006a** green in **`pnpm test`** and **`pnpm run test:e2e`**.

---

## Dependencies & execution order

### Phase dependencies

- **Phase 1 → 2 → 3 (US1) → 4 (US2) → 5 (US3) → 6** (complete)
- **Phase 7** depends on Phases **1–6** (uses existing Briefcase + session stores)

### Parallel opportunities

- **T025** and **T026** in parallel before T027
- **T034** and **T035** in parallel after T032

---

## Parallel example: Phase 7

```bash
# Together after reading data-model / contract:
# Vitest: src/composables/useNineDigitSeedMask.spec.ts
# Vitest: BriefcaseView.spec.ts (navigate seed mismatch)
```

---

## Implementation strategy

### MVP (historical)

Phases **1–3** delivered shareable seeds.

### Current increment

Complete **Phase 7** (**T025–T036**) to satisfy **Session 2026-04-08 (clarify)** in **`spec.md`**.

---

## Task summary

| Phase | Task IDs | Count | Status |
|-------|----------|-------|--------|
| Setup | T001 | 1 | done |
| Foundational | T002 | 1 | done |
| US1 | T003–T010 | 8 | done |
| US2 | T011–T016 | 6 | done |
| US3 | T017–T021 | 5 | done |
| Polish | T022–T024 | 3 | done |
| Post-clarify | T025–T036 | 12 | 11 done / T036 manual |
| **Total** | **T001–T036** | **36** | 35 done + T036 manual |

**Format validation**: Open work uses `- [ ]`; completed uses `- [x]`. **[Story]** only on US phases. **[P]** only where parallel-safe. Each line names at least one **file path**.
