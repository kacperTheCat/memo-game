---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests (mandatory for this repository)**: Every user story MUST include failing-first **Vitest** tasks and **Playwright** tasks per `.specify/memory/constitution.md`. Omitting tests requires a constitution amendment, not a silent skip.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project (default)**: Single repo, root `package.json`; `src/` for Vue app; Vitest in `src/**/*.spec.ts` and/or `tests/unit/`; Playwright in `e2e/` (or `tests/e2e/`) with `playwright.config.ts` at repo root
- **Other layouts**: If plan.md selects `backend/` + `frontend/`, adjust paths accordingly

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project; Vue SPA example):

- [ ] T004 [P] Configure Vite, TypeScript, Tailwind, and Pinia bootstrap per plan.md
- [ ] T005 [P] Add PWA/service worker shell and offline cache strategy (stub if story-owned)
- [ ] T006 [P] Add shared Canvas sizing / DPR utilities and game loop hooks
- [ ] T007 Configure Vitest and Playwright in CI (`vite build` → `vite preview` → E2E)
- [ ] T008 One-time asset ingest script and static image paths (if not already present)
- [ ] T009 Environment and build flags documented for preview vs production

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (mandatory) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Vitest spec for [pure logic / composable] in src/[path]/[name].spec.ts
- [ ] T011 [P] [US1] Playwright spec for [user journey] in e2e/[name].spec.ts (maps to acceptance scenarios)

### Implementation for User Story 1

- [ ] T012 [P] [US1] Add or extend Pinia store / composables in src/[path]
- [ ] T013 [US1] Implement Canvas rendering and input for [feature] in src/[path]
- [ ] T014 [US1] Wire Vue components and Tailwind layout in src/[path]
- [ ] T015 [US1] Client persistence hooks if story requires state (localStorage / IndexedDB per plan)
- [ ] T016 [US1] Error and edge-case handling for story scope
- [ ] T017 [US1] Verify Playwright + Vitest green for US1

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (mandatory) ⚠️

- [ ] T018 [P] [US2] Vitest spec in src/[path]/[name].spec.ts
- [ ] T019 [P] [US2] Playwright spec in e2e/[name].spec.ts

### Implementation for User Story 2

- [ ] T020 [P] [US2] Extend stores/composables in src/[path]
- [ ] T021 [US2] Canvas or UI changes in src/[path]
- [ ] T022 [US2] Vue components in src/[path]
- [ ] T023 [US2] Integrate with User Story 1 (if needed) without breaking US1 tests

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (mandatory) ⚠️

- [ ] T024 [P] [US3] Vitest spec in src/[path]/[name].spec.ts
- [ ] T025 [P] [US3] Playwright spec in e2e/[name].spec.ts

### Implementation for User Story 3

- [ ] T026 [P] [US3] Extend src/[path] for stores/composables
- [ ] T027 [US3] Canvas or UI in src/[path]
- [ ] T028 [US3] Final integration for US3 scope

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional Vitest coverage in src/ or tests/unit/ as needed
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Vitest and Playwright tests MUST be written and FAIL before implementation
- Pure logic / stores before Canvas glue
- Canvas and input before polish
- Story complete (all tests green) before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Vitest spec in src/[path]/[name].spec.ts"
Task: "Playwright spec in e2e/[name].spec.ts"

# Parallel implementation files (example):
Task: "Composables in src/composables/[name].ts"
Task: "Canvas module in src/game/[name].ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
