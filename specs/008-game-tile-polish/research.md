# Research: 008-game-tile-polish

## 1. Where animations run (canvas-first)

**Decision:** Keep the **playable grid on a single 2D canvas** (`GameCanvasShell.vue` + `canvasTileDraw.ts`). All flip, **collect/merge**, shake, and parallax smoothing are implemented as **parametric drawing** (transforms, alpha, offsets) driven by a **per-frame or rAF tick**, not as a DOM card stack.

**Rationale:** Matches constitution **II. Canvas-first gameplay**. DOM/CSS card flips would make the board non-canvas-primary and complicate hit-testing ownership.

**Alternatives considered:**

- DOM overlay per tile — rejected (violates canvas-first for the interactive surface).
- WebGL — rejected for this feature (unnecessary complexity for 2D cards).

## 2. Animation runtime: dependency vs in-repo easing

**Decision:** Implement motion with **`requestAnimationFrame` + small pure easing/lerp helpers** under `src/game/` (unit-tested with Vitest). **No new npm dependency in the first implementation pass.** Revisit only if timelines become unmanageable or profiling shows a clear gap.

**Rationale:** Spec **FR-012** allows a library, but canvas games typically need **numeric interpolation** each frame anyway; generic DOM animation libraries do not paint the canvas. Adding GSAP-like tooling still requires wiring tweens into `paint()`. Custom code keeps bundle size minimal and avoids another animation clock fighting `requestAnimationFrame`.

**Alternatives considered:**

- **GSAP** — strong for complex timelines; acceptable later if multiple concurrent per-tile tweens justify the cost.
- **Motion One** — optimized for DOM/WAAPI; poor fit as primary driver for canvas pixels.

## 3. Logical state vs visual state

**Decision:** Keep **`MemoryState` / `SessionSnapshot`** semantics focused on **game truth** (`concealed` | `revealed` | `matched`, pair lock). Hold **ephemeral visual progress** (reveal flip 0–1, **collect flight** positions/scale, **mismatch: shake then conceal flip** 0–1 per phase) in **`GameCanvasShell` (or a dedicated composable) only**, not persisted to `localStorage`. **Collection strip** chip list is **runtime-only** for v1 (not in snapshot); reload mid-game does not reconstruct strip order unless product adds schema later.

**Rationale:** Hydrating mid-animation is undefined; snapshots stay small and stable. `TileRuntimeState.flipProgress` exists in types today but is unused — either wire it only for non-persisted runtime or remove in favor of a separate `TileVisualState` map to avoid accidental serialization.

**Alternatives considered:**

- New engine phases (`revealing`) — more snapshot and engine surface area; defer unless UX requires gating input until flip completes.

## 4. Parallax “organic” motion

**Decision:** Replace raw pointer mapping with **smoothed targets**: lerp or critically-damped spring from current displayed offset to `parallaxOffset(...)`, optionally **per-cell phase stagger** based on index or distance from pointer. Keep **`prefers-reduced-motion`** behavior as today (skip or heavily reduce motion).

**Rationale:** Meets **FR-007** without extra dependencies; easy to unit-test the smoothing function in isolation.

## 5. Rarity → gradient + gold top tier

**Decision:** Add a small **`src/game/rarityTier.ts`** (or similar) defining an **ordered list of rarity strings** aligned with the CS-style ladder. **`isTopTier(rarity)`** returns true only for the highest band (per spec: **Covert** in current library). Face background: **linear/radial gradient** from `entry.color`; top tier uses a **fixed gold-forward palette**. **Concealed back:** no use of `entry.color` (today’s stroke on concealed is an information leak vs **FR-001**).

**Rationale:** Single source of truth for tier checks; testable without canvas.

## 6. Glass-like image treatment without killing fps

**Decision:** Prefer **gradients and semi-transparent overlays** drawn in canvas over the image quad. **Avoid `filter: blur`** on the canvas and avoid large full-canvas shadows. If **FR-012** fails on baseline hardware, **reduce overlay complexity** before dropping motion (per spec edge case).

**Rationale:** Blur and heavy filters are common jank sources on mobile GPUs.

## 7. Unified tile face (rectangular inner bounds)

**Decision:** Rarity gradient, **contain-scaled** artwork, and glass overlay share **one** clipped **rectangular** inner region (`innerW` × `innerH` after padding)—no nested square inset.

**Rationale:** Matches clarified **FR-005** / stakeholder intent: one cohesive card, not rectangle-with-square; grid topology unchanged.

## 8. Browser matrix & fps verification (SC-007)

**Decision:** Baseline manual profiling: **Chrome + Safari + Firefox** latest (and current extended-support channels as CI allows). Use **Performance** / **Rendering** tools: record a short session while triggering flip, **mismatch shake + flip-back**, **match collect/merge**, and parallax. **≥60 fps** average during each effect on a **named baseline machine** (document host OS/GPU in `quickstart.md`). **120 fps** on a high-refresh device when available.

**Rationale:** Satisfies measurable **SC-007** without mandating a specific commercial device lab.

## 9. Stitch / design reference

**Decision:** Spec marks Stitch as optional. Reuse existing repo **glassmorphism / briefcase** Stitch exports as **visual language hints** only; no new Stitch artifact required to start implementation.

---

## 10. Match feedback: collect strip (replaces fade-only)

**Decision:** Implement **FR-009** as **in-canvas** motion: reserve a **horizontal strip band** below the grid; on match, interpolate both tiles’ **center positions** and **uniform scale** toward the next **slot** in the strip; on completion, draw **one** chip per pair (reuse face draw at smaller size). **Hit testing** ignores the strip band. **Batch** = one pair at a time (coordinated two-tile flight); queue if a second match resolves before the first flight ends (avoid overlapping flights—serialize or extend spec if playtesting requires parallel flights).

**Rationale:** Satisfies canvas-first constitution; one rAF paint path; E2E can assert strip metadata without DOM cards.

**Alternatives considered:**

- DOM overlay for strip — rejected as primary (would split visual system; optional later for a11y labels only).
- Web Animations API on canvas — no native path; still need manual draw each frame.

---

## 11. Mismatch: shake then flip-back (**FR-010**)

**Decision:** Wrong pair uses **two sequential visual timelines** on the same two cells: (1) **shake** with faces fully visible; (2) **flip-back** animation to concealed (inverse of reveal flip), **not** an instantaneous `concealed` draw skip. Implement as explicit **phase enum** or sequential `t` segments in the shell (e.g. `mismatchPhase: 'shake' | 'flip_back'`) so paint and tests can observe order. Engine may still clear mismatch on existing timer; extend timer or sequence visuals so **combined** shake+flip fits **SC-004** and does not leave tiles interactable while logic is locked.

**Rationale:** Matches clarified spec; reads as deliberate feedback; reuses same flip math as reveal with reversed time.

**Alternatives considered:**

- Shake only then instant hide — **rejected** (violates **FR-010**).
- Flip-back without shake — **rejected** (spec requires both, ordered).

---

## Open points for implementation (non-blocking)

- Exact **durations** (ms) for flip, **collect**, **mismatch shake vs flip-back split** — choose sensible defaults; tune against **FR-011** / **SC-004** and `gamePlay.ts` / `tileMotionConstants.ts`.
- Whether first pick should ignore input until flip completes — product default: **keep current input model** unless playtesting shows double-tap issues.
