---
description: 'Task list for 015 Vercel deployment & debug peek visibility'
---

# Tasks: Hosted deployment and hidden game debug control (015)

**Input**: Design documents from `/specs/015-vercel-deployment/`  
**Prerequisites**: [`plan.md`](./plan.md), [`spec.md`](./spec.md), [`research.md`](./research.md), [`data-model.md`](./data-model.md), [`contracts/README.md`](./contracts/README.md), [`quickstart.md`](./quickstart.md)

**Tests (mandatory for this repository)**: Every user story includes failing-first **Vitest** and **Playwright** tasks per `.specify/memory/constitution.md`.

**Organization**: Phases follow user story priority (P1 → P2); setup and a minimal gate precede implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in the same wave)
- **[Story]**: `[US1]` / `[US2]` maps to [`spec.md`](./spec.md) user stories
- Descriptions include concrete file paths

## Phase 1: Setup (shared)

**Purpose**: Align implementer with artifacts and branch scope.

- [x] T001 Read [`specs/015-vercel-deployment/plan.md`](./plan.md) §Implementation notes and [`specs/015-vercel-deployment/research.md`](./research.md) §2–4 for helper API and E2E split
- [x] T002 [P] Read [`specs/015-vercel-deployment/quickstart.md`](./quickstart.md) and [`specs/015-vercel-deployment/contracts/README.md`](./contracts/README.md) for acceptance and Vercel settings table

---

## Phase 2: Foundational (blocking gate)

**Purpose**: Confirm existing CI pipeline still matches constitution before changing tests or app code.

**⚠️ CRITICAL**: Complete before User Story phases.

- [x] T003 [P] Review [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) for order Vitest → Playwright bootstrap (dev) → Playwright preview (`vite build` + `vite preview`) → lint; note any intentional change if adding jobs later

**Checkpoint**: Proceed to User Story 1.

---

## Phase 3: User Story 1 — No cheat-style debug control on hosted builds (Priority: P1) 🎯 MVP

**Goal**: Debug peek button (`data-testid="game-debug-peek-faces"`) hidden for all non-loopback contexts while **development** bundle is active; production/preview builds unchanged. Matches [`spec.md`](./spec.md) User Story 1 / FR-001–002, FR-005.

**Independent Test**: `pnpm build && pnpm preview` → `/game` has **no** peek button; `pnpm dev` on loopback → `/game` **has** peek button; CI green.

### Tests for User Story 1 (mandatory) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL (or expose wrong behavior) before implementation**

- [x] T004 [P] [US1] Add Vitest [`src/env/showGameDebugPeekUi.spec.ts`](../../src/env/showGameDebugPeekUi.spec.ts) for `isLoopbackHostname` / `showGameDebugPeekUi` per [`research.md`](./research.md) §5 (loopback positives + non-loopback negatives)
- [x] T005 [P] [US1] Add Playwright [`e2e/game-debug-peek-visibility.spec.ts`](../../e2e/game-debug-peek-visibility.spec.ts): on preview base URL, open `/game`, assert `getByTestId('game-debug-peek-faces')` count **0** (maps to acceptance scenario 1)
- [x] T006 [P] [US1] Add Playwright [`e2e/project-setup/game-debug-peek-dev.spec.ts`](../../e2e/project-setup/game-debug-peek-dev.spec.ts): on dev server, open `/game`, assert peek button **visible**; extend [`playwright.bootstrap.config.ts`](../../playwright.bootstrap.config.ts) `testMatch` to run `**/game-debug-peek-dev.spec.ts` alongside `bootstrap.spec.ts` (maps to acceptance scenario 2); extend [`playwright.config.ts`](../../playwright.config.ts) `testIgnore` so this file is **not** run against preview

### Implementation for User Story 1

- [x] T007 [US1] Implement [`src/env/showGameDebugPeekUi.ts`](../../src/env/showGameDebugPeekUi.ts) with `isLoopbackHostname(hostname: string)` and `showGameDebugPeekUi()` (`import.meta.env.DEV` + `typeof window` guard + loopback check) per [`plan.md`](./plan.md)
- [x] T008 [US1] Replace `showDebugPeekButton = import.meta.env.DEV` with `showGameDebugPeekUi()` (or equivalent `computed`) in [`src/components/game/GameCanvasShell.vue`](../../src/components/game/GameCanvasShell.vue)
- [x] T009 [US1] Update [`src/components/game/GameCanvasShell.spec.ts`](../../src/components/game/GameCanvasShell.spec.ts) so dev peek tests still pass under the new helper (mock/stub as needed)

### Verification for User Story 1

- [x] T010 [US1] Run `pnpm test`, `pnpm test:e2e`, and `pnpm lint` from repo root; fix any failures

**Checkpoint**: User Story 1 complete — mergeable MVP without Vercel dashboard work.

---

## Phase 4: User Story 2 — Shareable live app on Vercel (Priority: P2)

**Goal**: Production + preview HTTPS URLs on Vercel; deep links work; hosted `/game` has no debug peek control (inherits US1). Matches [`spec.md`](./spec.md) User Story 2 / FR-003–004.

**Independent Test**: Open Vercel production and preview URLs in a browser; `/`, `/game`, `/briefcase` load; no peek button on hosted `/game`.

### Tests for User Story 2 (mandatory) ⚠️

> Remote URL smoke is **manual** per [`spec.md`](./spec.md) (optional CI job not mandated). Automated proof remains local preview + dev E2E from US1.

- [x] T011 [US2] **Regression**: Re-run `pnpm test:e2e` after any `vercel.json` or README change to ensure US1 E2E still passes (maps to FR-005 / SC-004)

### Implementation for User Story 2

- [x] T012 [US2] In **Vercel dashboard**: link Git repo, set Node **22.x**, install `pnpm install`, build `pnpm build`, output **`dist`**, confirm first **production** and **preview** deploy succeed per [`contracts/README.md`](./contracts/README.md)
- [x] T013 [P] [US2] If cold-load on `/game` or `/briefcase` returns 404 on Vercel, add root [`vercel.json`](../../vercel.json) SPA rewrite to `/index.html`; otherwise skip and record “not needed” in PR description *(added standard SPA `rewrites` for deep links)*
- [x] T014 [P] [US2] Add a short **Deploy** subsection to [`README.md`](../../README.md) pointing to [`specs/015-vercel-deployment/quickstart.md`](./quickstart.md) for Vercel steps and smoke checks

### Verification for User Story 2

- [x] T015 [US2] Manual smoke on **production** and **preview** URLs: home loads, `/game` and `/briefcase` reachable, no `game-debug-peek-faces` on hosted `/game` per [`quickstart.md`](./quickstart.md)

**Checkpoint**: User Stories 1 and 2 both satisfied.

---

## Phase 5: Polish & cross-cutting

**Purpose**: Final consistency and documentation touchpoints.

- [x] T016 [P] Walk through [`specs/015-vercel-deployment/quickstart.md`](./quickstart.md) locally (preview + dev) after all code merges *(validated via `pnpm test:e2e`)*
- [x] T017 [P] Confirm no new `localStorage` keys introduced (N/A check per [`data-model.md`](./data-model.md))

---

## Dependencies & execution order

### Phase dependencies

- **Phase 1 (Setup)** → **Phase 2 (Foundational)** → **Phase 3 (US1)** → **Phase 4 (US2)** → **Phase 5 (Polish)**
- **US2** depends on **US1** for correct hosted behavior (debug hidden on production bundle); Vercel **dashboard** tasks can start after T006–T007 if staffed in parallel, but **T015** must wait until US1 code is deployed.

### User story dependencies

- **US1 (P1)**: No dependency on US2.
- **US2 (P2)**: Behaviorally depends on US1 being merged for hosted peek visibility; documentation (`README`, optional `vercel.json`) can proceed in parallel after US1 tests land.

### Within User Story 1

- **T004 → T007**: Vitest can fail until `showGameDebugPeekUi.ts` exists (T007).
- **T005–T006** can be authored alongside T004; **T008** follows T007.
- **T010** is the story gate.

### Parallel opportunities

| Wave | Tasks |
|------|--------|
| After T003 | T004, T005, T006 in parallel (different files) |
| After T007 | T009 can proceed once T008 is in progress or complete (same component family — prefer T008 before T009) |
| US2 | T013, T014 parallel after T012 decision on 404s |
| Polish | T016, T017 parallel |

---

## Parallel example: User Story 1

```bash
# After T003, author failing tests in parallel:
# - src/env/showGameDebugPeekUi.spec.ts
# - e2e/game-debug-peek-visibility.spec.ts
# - e2e/project-setup/game-debug-peek-dev.spec.ts + playwright.bootstrap.config.ts
```

---

## Implementation strategy

### MVP first (User Story 1 only)

1. Complete Phase 1–2  
2. Complete Phase 3 (US1): tests → `src/env/showGameDebugPeekUi.ts` → `GameCanvasShell.vue` → `GameCanvasShell.spec.ts` → full suite  
3. **Stop and validate** MVP; merge if Vercel can follow in a follow-up PR (not ideal for spec FR-003 but acceptable if dashboard access is delayed)

### Incremental delivery

1. US1 merged → CI green; preview/local behavior correct  
2. US2: Vercel project + optional `vercel.json` + README + manual smoke  

### Task counts

| Scope | Count |
|-------|-------|
| Setup | 2 |
| Foundational | 1 |
| US1 | 7 |
| US2 | 5 |
| Polish | 2 |
| **Total** | **17** |

---

## Notes

- **Deploy job** on `main`/`master` requires GitHub secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (see [`quickstart.md`](./quickstart.md)).
- Optional remote Playwright job against `VERCEL_PREVIEW_URL` is **out of scope** unless added in a later feature.
- Commit after each task group or logical checkpoint.
