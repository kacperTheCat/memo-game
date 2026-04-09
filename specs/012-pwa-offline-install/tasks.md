---
description: "Task list for 012-pwa-offline-install"
---

# Tasks: PWA offline persistence and install prompt (012)

**Input**: Design documents from `/specs/012-pwa-offline-install/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/README.md](./contracts/README.md)

**Tests (mandatory for this repository)**: Every user story includes failing-first **Vitest** and **Playwright** tasks per `.specify/memory/constitution.md`.

**Organization**: Tasks are grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label ([US1], [US2]) on story-phase tasks only
- Paths are relative to repository root unless noted

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm scope and static assets before implementation

- [x] T001 Verify `vite-plugin-pwa` is configured in `vite.config.ts`, and `public/audio/*.mp3` plus `public/tiles/*.png` exist per [plan.md](./plan.md) and [quickstart.md](./quickstart.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Versioned **`localStorage`** helpers, key constants, and **Workbox** updates — **required before US1 and US2**

**⚠️ CRITICAL**: No user story work until this phase completes

- [x] T002 Export `STORAGE_PLAYER_SETTINGS_KEY` and `STORAGE_PWA_INSTALL_UI_KEY` in `src/game/storage/sessionConstants.ts` matching [contracts/README.md](./contracts/README.md)
- [x] T003 [P] Add failing Vitest `src/game/storage/playerSettingsStorage.spec.ts` for `PlayerSettingsV1` parse defaults, invalid JSON rejection, and round-trip write shape per [contracts/player-settings.schema.json](./contracts/player-settings.schema.json)
- [x] T004 [P] Add failing Vitest `src/game/storage/pwaInstallUiStorage.spec.ts` for `outcome` transitions (`pending` → `seen` → `dismissed` | `installed`) per [data-model.md](./data-model.md)
- [x] T005 Extend `vite.config.ts` **`VitePWA` → `workbox`**: add **`mp3`** to **`globPatterns`** and **`runtimeCaching`** for `fonts.googleapis.com` / `fonts.gstatic.com` per [research.md](./research.md) §1–2
- [x] T006 Implement `src/game/storage/playerSettingsStorage.ts` (read/write/validate `memo-game.v1.playerSettings`) until `src/game/storage/playerSettingsStorage.spec.ts` passes
- [x] T007 Implement `src/game/storage/pwaInstallUiStorage.ts` (read/write `memo-game.v1.pwaInstallUi`) until `src/game/storage/pwaInstallUiStorage.spec.ts` passes

**Checkpoint**: `pnpm test` green for new storage modules; production build includes audio precache entries

---

## Phase 3: User Story 1 — Game state and settings survive refresh and work offline (Priority: P1) 🎯 MVP

**Goal**: Persist **`difficulty`** + **`briefcaseSeedRaw`** across reloads; **`memo-game.v1.inProgress`** restore unchanged; offline play after first load per [spec.md](./spec.md) FR-001–004

**Independent Test**: Change briefcase settings → reload → unchanged; mid-game reload → board restore; offline → finish a round ([quickstart.md](./quickstart.md))

### Tests for User Story 1 (mandatory) ⚠️

> Write **first**; they MUST **fail** before implementation lands

- [x] T008 [P] [US1] Add failing Playwright `e2e/pwa-persistence-offline.spec.ts` mapping to spec acceptance scenarios 1–4: briefcase difficulty (+ optional seed field) survives reload; in-progress reload restores tiles; **`context.setOffline(true)`** after SW ready allows completing a round without network errors

### Implementation for User Story 1

- [x] T009 [US1] Hydrate `useGameSettingsStore` from `src/game/storage/playerSettingsStorage.ts` after Pinia is installed (e.g. `src/main.ts` or `src/stores/index.ts`) before first navigation reads settings
- [x] T010 [US1] Subscribe to `useGameSettingsStore` changes with **~300ms** debounced writes of **`difficulty`** + **`briefcaseSeedRaw`** only (exclude **`dealSeed`**) per [data-model.md](./data-model.md)
- [x] T011 [US1] After `applyRouteQuery()` in `src/views/game/GameView.vue`, sync query overrides into persisted **`PlayerSettingsV1`** per [contracts/README.md](./contracts/README.md) recommendation
- [x] T012 [US1] Green `e2e/pwa-persistence-offline.spec.ts` (use `page.waitForFunction` / service worker readiness as needed) and `pnpm test` for US1-related Vitest files

**Checkpoint**: User Story 1 fully testable alone; MVP = P1 complete

---

## Phase 4: User Story 2 — One-time, styled install invitation (Priority: P2)

**Goal**: Bottom install sheet, **`beforeinstallprompt`** / **`appinstalled`** / standalone gating, **`memo-game.v1.pwaInstallUi`** outcomes per [spec.md](./spec.md) FR-004–007

**Independent Test**: Synthetic install event → sheet shown once → dismiss → reload → hidden; Chromium-focused ([research.md](./research.md) §7)

### Tests for User Story 2 (mandatory) ⚠️

> Write **first**; they MUST **fail** before UI lands

- [x] T013 [P] [US2] Extend failing Playwright `e2e/pwa-install-prompt.spec.ts` for bottom sheet visibility (`data-testid` on root), synthetic **`BeforeInstallPromptEvent`** via `page.evaluate`, **Not now** → **`dismissed`** → no sheet on reload; maps to spec acceptance scenarios 5–8 where APIs allow

### Implementation for User Story 2

- [x] T014 [US2] Add English user-visible strings for install sheet (title, body, **Install**, **Not now**) in `src/constants/appCopy.ts` (or dedicated `src/constants/pwaInstallCopy.ts` imported from app copy barrel if preferred)
- [x] T015 [US2] Add `src/composables/pwa/usePwaInstallPrompt.ts`: capture **`beforeinstallprompt`** (`preventDefault`), stash deferred prompt, **`appinstalled`** → **`installed`**, **`matchMedia('(display-mode: standalone)')`** / iOS **`navigator.standalone`** → hide sheet, integrate `src/game/storage/pwaInstallUiStorage.ts` (**`pending`**/**`seen`**/**`dismissed`**/**`installed`**)
- [x] T016 [US2] Add `src/components/pwa/PwaInstallSheet.vue` (bottom **`fixed`** sheet, Tailwind + `AppButton` / existing tokens, dismiss without blocking canvas when hidden) and mount from `src/App.vue`
- [x] T017 [US2] Green `e2e/pwa-install-prompt.spec.ts` + no regressions in `src/game/storage/pwaInstallUiStorage.spec.ts`

**Checkpoint**: US1 and US2 both pass tests independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Repo-wide validation and documentation alignment

- [x] T018 Run `pnpm run lint`, `pnpm test`, and full Playwright (`pnpm run test:e2e` or `pnpm run test:e2e:preview` per root `package.json`) from repository root
- [x] T019 [P] Update `specs/012-pwa-offline-install/quickstart.md` if final `data-testid` names, SW wait helpers, or test commands differ from current text

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3 (US1)** → **Phase 4 (US2)** → **Phase 5**
- **US2** does not require US1 code paths beyond shared **`sessionConstants`** / storage modules finished in Phase 2; run **US1 before US2** on a single branch to reduce `App.vue` merge friction

### User Story Dependencies

- **US1**: After Phase 2; uses **`playerSettingsStorage`** + Workbox precache
- **US2**: After Phase 2; uses **`pwaInstallUiStorage`**; touches **`App.vue`** — sequential after US1 recommended for one developer

### Within Each User Story

- Playwright **failing** (T008 / T013) before implementation tasks
- Storage modules already green from Phase 2 before US1/US2 wiring

### Parallel Opportunities

- **Phase 2**: T003 ∥ T004 (both Vitest files); T006 ∥ T007 after T003–T005 (different implementation files)
- **US1**: T008 alone first; T009 ∥ T010 possible only if different files and no conflict — prefer T009 → T010 → T011 sequence
- **US2**: T013 before T014–T016; T014 ∥ T015 possible (copy vs composable)

---

## Parallel Example: Phase 2

```bash
# Together after T002 + T005 land:
Task: "Vitest src/game/storage/playerSettingsStorage.spec.ts"
Task: "Vitest src/game/storage/pwaInstallUiStorage.spec.ts"
```

---

## Parallel Example: User Story 1

```bash
# After Phase 2 complete — add failing E2E before wiring:
Task: "Playwright e2e/pwa-persistence-offline.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 + Phase 2  
2. Complete Phase 3 (US1)  
3. **STOP and VALIDATE**: persistence + offline E2E  
4. Demo MVP

### Incremental Delivery

1. Foundation → US1 → validate  
2. US2 → validate install UX  
3. Polish (lint + full E2E + quickstart)

---

## Notes

- **`dealSeed`** MUST NOT be persisted ([data-model.md](./data-model.md))  
- Do **not** bump **`SessionSnapshot`** `schemaVersion` ([spec.md](./spec.md) FR-008)  
- **`seen`** MUST be written when the sheet is first shown so refresh does not re-prompt ([data-model.md](./data-model.md))  
- Avoid third-party **`@khmyznikov/pwa-install`** unless plan amendment ([research.md](./research.md) §4)
