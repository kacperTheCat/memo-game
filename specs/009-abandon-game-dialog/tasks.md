---
description: "Task list — Abandon confirmation app dialog (009), incl. FR-002 Unlock + any in_progress"
---

# Tasks: Abandon confirmation app dialog

**Input**: Design documents from `/specs/009-abandon-game-dialog/`  
**Prerequisites**: [`plan.md`](./plan.md), [`spec.md`](./spec.md) (incl. **Clarifications**), [`research.md`](./research.md) §7, [`data-model.md`](./data-model.md), [`contracts/confirm-dialog-ui.md`](./contracts/confirm-dialog-ui.md), [`quickstart.md`](./quickstart.md)

**Context**: **US1** (game **Abandon**) and shared **`MemoConfirmDialog`** are largely implemented. This list emphasizes the **FR-002** delta: **Unlock showcase** must **`requestConfirm`** whenever **`gameSession.status === 'in_progress'`**, including when Briefcase difficulty/seed **match** the session (**spec** scenarios **5–6**). **`resumeToGame`** stays confirm-free.

**Tests (constitution)**: Vitest + Playwright for changed behavior.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallel-safe (different files or no ordering dependency)
- **[Story]**: `[US1]` / `[US2]` on user-story phases only

## Phase 1: Setup (copy)

**Purpose**: English body text for “same settings, new deal” Unlock path (**[`research.md`](./research.md) §7**).

- [x] T001 [P] Add `briefcaseUnlockSameSettingsNewDeal` (or equivalent name) to `src/constants/appCopy.ts` — message explains abandoning the current in-progress game to start a **new** deal with the same Briefcase settings (statistics/outcome wording consistent with existing abandon copy). Export for use by `useBriefcaseNavigateToGame`.

---

## Phase 2: Foundational checkpoint

**Purpose**: Confirm shared dialog + US1 path still valid before changing composable.

- [x] T002 Run `pnpm exec vitest run src/components/ui/MemoConfirmDialog.spec.ts src/views/GameView.abandonDialog.spec.ts` and fix failures if any.

**Checkpoint**: US1 Vitest green.

---

## Phase 3: User Story 1 — Confirm abandoning from game (Priority: P1)

**Goal**: No regression when **US2** composable changes land.

**Independent Test**: Abandon dialog; cancel/confirm; no `window.confirm`.

### Tests for User Story 1

- [x] T003 [P] [US1] After **T008** (composable change), re-run `src/views/GameView.abandonDialog.spec.ts`; update only if US2 work accidentally breaks imports/globals.

### Implementation for User Story 1

- [x] T004 [US1] No functional change expected for `src/views/GameView.vue` for FR-002; if drift appears, align only with **FR-001**.

**Checkpoint**: US1 remains independently testable.

---

## Phase 4: User Story 2 — Unlock showcase + in progress (Priority: P2) 🎯 FR-002

**Goal**: **`navigateToGame`** prompts on **any** `in_progress` session; message = mismatch copy vs **T001** match copy; confirm → abandon + **new** deal via existing `router.push` + `memoDealInit`.

**Independent Test**: Matching **and** mismatching Briefcase settings → dialog; cancel leaves `in_progress`; confirm navigates to `/game`.

### Tests for User Story 2 (write/adjust first) ⚠️

- [x] T005 [P] [US2] Vitest: extend `src/composables/useBriefcaseNavigateToGame.spec.ts` — **`in_progress`** + **matching** difficulty **`dealBriefcaseSeedRaw`** → `requestConfirm` called with **`briefcaseUnlockSameSettingsNewDeal`** (or final chosen export from **T001**); `false` → no `router.push`; `true` → `finalizeSession('abandoned')`, `resetRound`, `push` with `memoDealInit`.
- [x] T006 [P] [US2] Vitest: add case in `src/components/briefcase/BriefcaseView.spec.ts` — `beginSession('easy')`, Briefcase shows **easy** + matching seed vs `dealBriefcaseSeedRaw`, click **Unlock showcase** → `memo-confirm-dialog` → cancel stays briefcase `in_progress`; confirm → `game` route (use `attachTo: document.body` for Teleport).
- [x] T007 [P] [US2] Playwright: extend `e2e/abandon-confirmation-dialog.spec.ts` for **spec** scenario **5** (in progress, **matching** Briefcase, Unlock → dialog visible → confirm → `/game`; optionally assert fresh-deal signal if stable in suite).

### Implementation for User Story 2

- [x] T008 [US2] Refactor `src/composables/useBriefcaseNavigateToGame.ts`: after seed-incomplete guard, if **`gs?.status === 'in_progress'`**, compute `const mismatch = difficultyMismatch || seedMismatch`, `message = mismatch ? briefcaseUnlockAbandonInProgress : briefcaseUnlockSameSettingsNewDeal`, **`await requestConfirm(message)`**; on `false` return; on `true` **`finalizeSession('abandoned')`**, **`play.resetRound`**, then **`router.push`**. Remove “confirm only on mismatch” branching. Update file JSDoc to cite **FR-002** / spec **Unlock** semantics (**not** **resumeToGame**).
- [x] T009 [US2] Ensure `src/components/briefcase/BriefcaseView.vue` still passes `requestConfirm` only; no UI change unless `memoConfirmBriefcaseMismatchTitle` should vary by case (optional polish — defer unless spec requires).

**Checkpoint**: US2 scenarios **4–6** covered by automated tests.

---

## Phase 5: Polish & cross-cutting

- [x] T010 Run `pnpm test` and `pnpm run lint` from repo root.
- [x] T011 [P] Manual smoke per `specs/009-abandon-game-dialog/quickstart.md` (covered by T007 E2E + Vitest) (matching + mismatch Unlock).

---

## Dependencies & execution order

| Phase | Depends on |
|-------|------------|
| 1 | — |
| 2 | 1 optional (copy used in 8) |
| 3 | 2; run **T003** after **T008** |
| 4 tests T005–T007 | **T001**; **T008** satisfies **T005**/**T006** |
| 4 impl T008–T009 | Prefer **T005–T006** written first (red) then **T008** (green) |
| 5 | **T008** + **T005–T007** green |

**Recommended order:** T001 → T002 → T005/T006 (expect red) → **T008** → T007 Playwright → T003/T009 → T010/T011.

### Parallel example (US2)

```bash
pnpm exec vitest run src/composables/useBriefcaseNavigateToGame.spec.ts &
pnpm exec vitest run src/components/briefcase/BriefcaseView.spec.ts &
wait
```

---

## Implementation strategy

1. **T001** copy constant.
2. **T005–T006** (and **T007**) define failing or extended expectations.
3. **T008** composable — green unit tests.
4. **T007** E2E, then **T010** full suite.
5. **US1** **T003–T004** quick regression pass.

### MVP slice

If time-boxed: **T001** + **T008** + **T005** + **T010** minimum; add **T006**–**T007** before merge.

---

## Notes

- **`briefcaseUnlockAbandonDifferentDifficulty`** deprecated alias in `appCopy.ts` — keep re-exports if tests/docs grep it.
- Do not add npm modal libraries.
