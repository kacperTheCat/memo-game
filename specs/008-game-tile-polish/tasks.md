# Tasks: Game tile visual polish and motion (008)

**Input**: Design documents from `/specs/008-game-tile-polish/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/game-canvas-ui.md](./contracts/game-canvas-ui.md), [quickstart.md](./quickstart.md)

**Tests (mandatory)**: Failing-first **Vitest** and **Playwright** per `.specify/memory/constitution.md` and [spec.md](./spec.md).

**Format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup (shared)

**Purpose**: Confirm context before implementation.

- [x] T001 Confirm git branch `008-game-tile-polish` and read `specs/008-game-tile-polish/plan.md`, `spec.md`, and `contracts/game-canvas-ui.md`

---

## Phase 2: Foundational (blocking)

**Purpose**: Shared layout, hit testing, types, and persistence rules. **No user story work until this phase completes.**

**Checkpoint**: Grid picks only the **board band**; strip area excluded; snapshot rules clear.

- [x] T002 [P] Verify or implement `src/game/tiles/rarityTier.ts` with ordered ladder + `isTopTier` + Vitest `src/game/tiles/rarityTier.spec.ts` (**FR-003**, **FR-004**)
- [x] T003 [P] Verify or implement `src/game/animation/animationEasing.ts` (`clamp01`, `lerp`, ease curves) + Vitest `src/game/animation/animationEasing.spec.ts` for rAF-driven motion
- [x] T004 Ensure `SessionSnapshot` / `buildSnapshot` in `src/stores/game/gameSession.ts` never persists ephemeral animation or strip state; adjust `src/game/memory/memoryTypes.ts` + `src/stores/game/gameSession.spec.ts` per [data-model.md](./data-model.md)
- [x] T005 Add **board band vs collection strip band** layout to `src/game/canvas/canvasLayout.ts` (constants + `boardAreaCssRect(fullW, fullH)` or equivalent) + extend Vitest `src/game/canvas/canvasLayout.spec.ts`
- [x] T006 Update `src/game/canvas/canvasHitTest.ts` and `src/components/game/GameCanvasShell.vue` so `cellIndexFromPointer` uses **board** dimensions only and ignores clicks in the strip band ([plan.md](./plan.md))
- [x] T007 Run `.specify/scripts/bash/update-agent-context.sh cursor-agent` from repo root (note if script warns on `grep`)

---

## Phase 3: User Story 1 — Fair hidden tiles (Priority: P1)

**Goal**: Face-down tiles are visually identical regardless of item identity or rarity (**FR-001**, spec scenarios 1–2).

**Independent Test**: New deal, all concealed — no per-item color or pattern from catalog on backs.

### Tests for User Story 1 (mandatory)

> Write tests first; they must **fail** before implementation where behavior is not yet correct.

- [x] T008 [P] [US1] Vitest `src/game/canvas/canvasTileDraw.neutralBack.spec.ts` — concealed path must not apply catalog `color` / rarity stroke (mock `CanvasRenderingContext2D`)
- [x] T009 [P] [US1] Playwright `e2e/tile-visual-polish.spec.ts` — scenarios 1–2 (neutral concealed backs; no rarity-driven back styling)

### Implementation for User Story 1

- [x] T010 [US1] Update `src/game/canvas/canvasTileDraw.ts` concealed branch: uniform neutral back; no item-colored borders (**FR-001**)
- [x] T011 [US1] Adjust `src/components/game/GameCanvasShell.vue` / `drawTile` args if concealed path must not receive catalog stroke color
- [x] T012 [US1] Verify `pnpm test` and Playwright `e2e/tile-visual-polish.spec.ts` pass for US1 scope

**Checkpoint**: US1 complete and independently testable.

---

## Phase 4: User Story 2 — Reveal, collect, mismatch sequence (Priority: P2)

**Goal**: Flip on reveal (**FR-008**); **collect-and-merge** to strip below grid with shrink-in-flight (**FR-009**, **FR-009a**); **shake then flip-back** to concealed on wrong pair (**FR-010**); no stuck tiles (**FR-011**); tests per **FR-013** (spec scenarios 3–6).

**Independent Test**: One correct pair (collect + strip entry) and one wrong pair (shake then flip-back), without relying on rarity gradients.

### Tests for User Story 2 (mandatory)

- [x] T013 [P] [US2] Vitest new or extend `src/game/tiles/collectStripLayout.spec.ts` (or `canvasLayout.spec.ts`) — pure helpers for strip slot positions / scale curve along collect `t∈[0,1]` if factored out
- [x] T014 [P] [US2] Vitest `src/game/tiles/tileAnimationBudget.spec.ts` (or new `mismatchPhaseTiming.spec.ts`) — shake + flip-back + collect durations stay within **SC-003** / **SC-004** / **FR-011** vs `src/stores/game/gamePlay.ts` / `src/game/tiles/tileMotionConstants.ts`
- [x] T015 [P] [US2] Extend `e2e/tile-visual-polish.spec.ts` for scenarios 3–6: flip smoke; **match** → `data-collect-count` (or equivalent per [contracts/game-canvas-ui.md](./contracts/game-canvas-ui.md)) increases within bounded time; **mismatch** → optional `data-mismatch-phase` observes `shake` before `flip_back`; rapid input safety

### Implementation for User Story 2

- [x] T016 [US2] Add SR-only hooks in `src/components/game/GameCanvasShell.vue`: `data-testid="game-collect-strip"` with `data-collect-count`; optional `data-mismatch-phase` on shell (`idle` \| `shake` \| `flip_back`) per contract
- [x] T017 [US2] Implement ephemeral **collect flight** + runtime **`stripChips`** list + paint in `GameCanvasShell.vue` and `src/game/canvas/canvasTileDraw.ts` (**FR-009**); serialize overlapping collects if needed ([research.md](./research.md) §10)
- [x] T018 [US2] Implement **mismatchPhase** sequence: shake while face-up, then **concealFlipT** flip-back (**FR-010**); reconcile with `gamePlay` mismatch timer / `clearMismatch` (**FR-011**, spec edge case on timing)
- [x] T019 [US2] Implement or verify **reveal flip** (**FR-008**) in rAF driver + `canvasTileDraw.ts`
- [x] T020 [US2] Verify Vitest + Playwright green for US2 scope

**Checkpoint**: US1 + US2 both pass tests.

---

## Phase 5: User Story 3 — Rarity face styling (Priority: P3)

**Goal**: Rarity gradients, gold top tier, no decorative borders, **unified rectangular** face (gradient + art + glass) (**FR-002**–**FR-006**, spec scenarios 7–9).

**Independent Test**: Reveal mixed rarities; one cohesive card face; top tier reads gold-forward.

### Tests for User Story 3 (mandatory)

- [ ] T021 [P] [US3] Vitest `src/game/tiles/tileFaceStyle.spec.ts` — top tier → gold palette vs catalog `#hex` gradients using `src/game/tiles/rarityTier.ts`
- [ ] T022 [P] [US3] Extend `e2e/tile-visual-polish.spec.ts` for scenarios 7–9 (smoke: distinct top-tier treatment, no old border ring, unified face)

### Implementation for User Story 3

- [ ] T023 [US3] Face background gradients in `src/game/canvas/canvasTileDraw.ts` using `entry.color` + `isTopTier(entry.rarity)`; remove old border emphasis (**FR-002**–**FR-004**)
- [ ] T024 [US3] Unified inner-rect image + glass overlay in `src/game/canvas/canvasTileDraw.ts` (**FR-005**–**FR-006**)
- [ ] T025 [US3] Verify Vitest + Playwright green for US3 scope

**Checkpoint**: US1–US3 pass.

---

## Phase 6: User Story 4 — Organic parallax (Priority: P4)

**Goal**: Smoothed / staggered parallax (**FR-007**, spec scenario 10).

**Independent Test**: Slow pointer sweep — no harsh snapping; `prefers-reduced-motion` respected.

### Tests for User Story 4 (mandatory)

- [x] T026 [P] [US4] Vitest `src/game/tiles/tileParallaxSmooth.spec.ts` — smoothing converges toward `parallaxOffset` without instability
- [x] T027 [P] [US4] Extend `e2e/tile-visual-polish.spec.ts` for scenario 10 (pointer move on `data-testid="game-canvas-shell"` still drives visible parallax)

### Implementation for User Story 4

- [x] T028 [US4] Wire `src/game/tiles/tileParallaxSmooth.ts` into `src/components/game/GameCanvasShell.vue` paint path; respect reduced motion (**FR-007**)
- [x] T029 [US4] Verify Vitest + Playwright green for US4 scope

**Checkpoint**: All four user stories green.

---

## Phase 7: Polish and cross-cutting

**Purpose**: Performance gate, full suite, cost reduction if needed.

- [ ] T030 [P] Follow FPS / profiling steps in `specs/008-game-tile-polish/quickstart.md`; record **SC-007** outcome (device + browser + approximate fps) in PR description or quickstart appendix
- [x] T031 Run `pnpm test`, `pnpm run lint`, and `pnpm run test:e2e:preview` from repo root `/Users/kacperthecat/memo game/memo-game`
- [ ] T032 [P] If **FR-012** not met on baseline hardware, reduce glass/gradient cost in `src/game/canvas/canvasTileDraw.ts` before adding npm animation dependencies ([research.md](./research.md) §2)

---

## Dependencies and execution order

### Phase dependencies

| Phase | Depends on |
|-------|------------|
| 1 Setup | — |
| 2 Foundational | Phase 1 |
| 3 US1 | Phase 2 |
| 4 US2 | Phase 2 (complete **after US1** to avoid concealing regressions while building motion) |
| 5 US3 | Phase 2 (prefer **US2 → US3** — both touch `canvasTileDraw.ts`) |
| 6 US4 | Phase 2 |
| 7 Polish | Desired US1–US4 scope |

**Recommended solo sequence**: Phase 1 → 2 → **US1 → US2 → US3 → US4** → Polish.

### User story notes

- **US1**: No dependency on other stories.
- **US2**: Collect + strip + mismatch phases; highest integration risk in `GameCanvasShell.vue`.
- **US3**: After US2 to limit `canvasTileDraw.ts` merge pain.
- **US4**: Mostly shell + `tileParallaxSmooth.ts`; can follow US3.

### Parallel opportunities

- Phase 2: T002, T003 in parallel; T005 vs T006 sequential (hit test depends on layout API).
- Per story: paired Vitest + Playwright tasks before implementation.
- Phase 7: T030 and T032 can split focus (profiling vs draw cost).

---

## Parallel example: User Story 2

```bash
# After Phase 2 + US1, start US2 tests together:
# - src/game/tiles/collectStripLayout.spec.ts (or canvasLayout.spec.ts)
# - src/game/tiles/tileAnimationBudget.spec.ts
# - e2e/tile-visual-polish.spec.ts (scenarios 3–6)

# Then implement hooks + collect + mismatch in:
# - src/components/game/GameCanvasShell.vue
# - src/game/canvas/canvasTileDraw.ts
# - src/stores/game/gamePlay.ts / src/game/tiles/tileMotionConstants.ts (timing alignment)
```

---

## Implementation strategy

### MVP (User Story 1 only)

1. Phase 1 + Phase 2  
2. Phase 3 (US1)  
3. Stop and validate fair concealed backs.

### Full feature (spec 008)

1. Phase 1 + 2  
2. US1 → US2 → US3 → US4  
3. Phase 7 polish + SC-007 note.

### Task counts

| Area | Count |
|------|------|
| Setup | 1 |
| Foundational | 6 |
| US1 | 5 |
| US2 | 8 |
| US3 | 5 |
| US4 | 4 |
| Polish | 3 |
| **Total** | **32** |

---

## Notes

- Extend `e2e/tile-visual-polish.spec.ts` incrementally; use `test.skip` only if strict red-first workflow requires it before hooks exist.
- Constitution: canvas remains the primary game surface; do not move the interactive grid to DOM cards.
- **US2** supersedes older “match fade” wording: implementation target is **collect-and-merge** + **shake → flip-back**, not opacity-only match removal.
