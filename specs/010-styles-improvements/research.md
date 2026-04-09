# Research: 010 Styles improvements (ambient visuals)

## 1. Cursor spotlight — cloud chase, lowest z-order

**Decision:** Implement a **fixed, full-viewport** ambient layer (`pointer-events-none`) per view with a **radial gradient** (or blurred pseudo-element) whose **center** is driven by **smoothed coordinates** (`lerp` or **critically-damped spring** toward the active input position). Add **low-amplitude secondary motion** (slow noise or secondary spring offset) so the centroid is never rigidly locked. **Wind (FR-001c):** apply **mild anisotropic scale + rotation** to the blob from **smoothed velocity** of the chase output, scaled by the same **visibility envelope** as opacity; **off** under `prefers-reduced-motion`. **Visibility envelope** (opacity): see **§2** for **mouse idle fade** and **touch-only** rules. **Stacking:** `z-index` below content shells (e.g. `z-0` or negative stack vs `z-10` main columns), consistent with `HomeView` / `BriefcaseViewPage` patterns (`HubGrainLayer` at `-z-10`, content at `z-10`). **Overflow:** fixed layer ensures **viewport-normalized** placement when layout width exceeds the viewport (e.g. wide Home ledger).

**Rationale:** Matches FR-001 / SC-006; pure CSS cannot alone express lag + organic drift toward moving pointer without JS. Springs/lerp are cheap (two floats per frame, `requestAnimationFrame` or pointer handler + rAF batch).

**Alternatives considered:** CSS `radial-gradient` with instant `background-position` from pointer (rejected: violates “cloud chase”); single heavy blur filter on whole viewport (rejected: GPU cost vs one gradient blob).

## 2. Mouse idle fade + touch-only spotlight (FR-001a / FR-001b)

**Decision:**

- **Mouse / fine pointer:** After **~400 ms** without **`pointermove`** (mouse path only), drive a **visibility envelope** (layer **opacity** or equivalent) from **1 → 0** over **~300–400 ms** ease-out. On the next move, ramp **up** over **~380–450 ms** (current **420 ms** fade-in). Idle and fade durations are **tunable constants** next to `useAmbientChaseLight` (see `plan.md` §Implementation notes).
- **Touch:** Spotlight is **visible only while at least one touch is active**. Track **`touches.length`** (and/or `pointerdown`/`pointerup` with `pointerType === 'touch'`). On **release** (`touchend` / `touchcancel` when no touches remain), **fade out ~150–250 ms**—**no** persistent glow at last point (supersedes prior “hold last touch” research).

**Rationale:** Matches clarifications and SC-007 / SC-008; avoids distracting glow at rest on desktop and misleading “ghost” touch highlights after lift.

**Alternatives:** Hold last touch after `touchend` (rejected: contradicts FR-001b); instant on/off without fade (acceptable for touch end if “promptly” is met—plan prefers short fade for polish).

## 3. Game card — cursor-reactive face gradient (canvas)

**Decision:** Extend **canvas** draw path (`drawFaceContent` in `canvasTileDraw.ts`): compute pointer position **relative to each tile’s inner face rect** while `phase === 'revealed'` (and optionally other phases per product). Build a **radial gradient** (or biased linear gradient) with **highlight stop** near the normalized pointer `(nx, ny)` in the rect; **lerp** gradient focal parameters each frame toward the new pointer-relative target (`GameCanvasShell` already tracks `pointerCss` / board geometry).

**Rationale:** Constitution requires canvas-first board; gradient must not force DOM tiles.

**Alternatives:** DOM overlay per card (rejected: violates canvas-first).

## 4. Briefcase yellow ambience — smoke / wander

**Decision:** Replace or augment static `bg-memo-accent/10` blurred orbs in `BriefcaseViewPage.vue` with **one composited layer** (or 2–3 blobs) whose **transform** and **border-radius / scale** are driven by **rAF** using smoothed random targets (Perlin-like not required: **periodic reroll** of target x/y/scale/radius with spring smoothing). Keep **same z-order band** as spotlight (both inside `briefcase-backdrop` under `z-10` content).

**Rationale:** Satisfies FR-005/FR-006 without WebGL; blur + morphing border-radius reads as “smoke.”

**Alternatives:** CSS-only `animate-blob` keyframes (rejected: too repetitive for “non-repeating-feeling” SC-003); `<canvas>` smoke (deferred: complexity).

## 5. Grain motion — Home & Briefcase

**Decision:** **Animate** the noise layer via one of: (a) **CSS `@keyframes`** shifting `background-position` on the tiled noise SVG data-URL layer; (b) small **SVG `<feTurbulence>`** `baseFrequency` or `seed` animation via **SMIL** or **JS** (if supported and perf OK). Default **(a)** for simplicity and wide support.

**Rationale:** FR-008 / SC-004; minimal risk. `HubGrainLayer` is shared—extend component or scoped class for motion-safe animation; respect `prefers-reduced-motion` (`motion-reduce:animate-none`).

**Alternatives:** Canvas grain (rejected: duplicate stack).

## 6. Operation Complete — staggered letters (FR-007)

**Decision:** **Traceability:** The string **Operation Complete** currently lives in **`WinDebriefPanel.vue`** (win debrief after a win), not on Briefcase. Implement FR-007 there unless product moves copy; treat spec “Briefcase” wording as **stakeholder missync**—acceptance is tied to the **Operation Complete** heading wherever it ships.

**Animation:** Wrap heading in **per-character spans** (preserve spaces); on **view enter** (`v-if` debrief visible / `onMounted` + `watch`), apply **staggered opacity/transform** (CSS variables + transition-delay, or **spring** in JS). **Pretext (`@chenglou/pretext`):** framework-agnostic measurement library; for a **single-line English heading**, simple span split meets SC-002; **add `@chenglou/pretext` only if** implementation needs DOM-free glyph metrics (e.g. future multi-line). Initial implementation: **no new dependency** unless tasks require Pretext explicitly.

**Rationale:** Smaller bundle and faster delivery; spec allows planning to choose integration.

**Alternatives:** Full Pretext pipeline for one line (deferred); third-party Vue typewriter (rejected: extra dep).

## 7. Reduced motion

**Decision:** Gate **rAF** noise on spotlight/ambience, **CSS animation** on grain, and **stagger delays** on Operation Complete behind **`matchMedia('(prefers-reduced-motion: reduce)')`** — snap spotlight to target or static gradient; static grain; minimal or no letter stagger (instant full opacity).

**Rationale:** FR-009 / SC-005.

## 8. Performance budget

**Decision:** **≤1 rAF** subscriber per view combining spotlight + (briefcase) ambience updates where possible. Avoid `filter: blur()` on full viewport; keep blur on **limited** elements. Target **60 fps** on mid-tier laptop; if profiling fails, reduce secondary noise frequency or disable shape morph on low-end (documented fallback in tasks).

**Rationale:** Aligns with spec assumption and constitution performance principle.

## 9. Browser matrix

**Decision:** Same as 008: **Latest** Chromium, **Firefox**, **Safari** on supported OS; verify **Safari** for `backdrop-filter` + animated `background-position` on noise layers.

**Rationale:** Constitution copy + browser targets.

## 10. Playwright strategy

**Decision:** Prefer **stable hooks**: `data-testid="ambient-spotlight"` on spotlight root, **`data-ambient-spotlight-active="true"|"false"`** (or assert `opacity` / `style` cross-browser) for **mouse idle** (move → stop → expect inactive). Debrief: `operation-complete-heading`; briefcase: `briefcase-backdrop`. Assertions: **z-order** via **bounding-box overlap** or `z-index` ordering where feasible; **CSS custom properties** for pointer-driven gradient on canvas shell if needed. **Touch (SC-008):** use Playwright **`hasTouch: true`** project or defer to manual review; automate only if stable.

**Rationale:** Visual effects are hard to assert; behavioral hooks for idle/active beat screenshots alone.

## 11. Operation Complete — visibility vs clip

**Decision:** If staggered children sit under a parent with **`background-clip: text`**, glyphs can **clip to invisible**. Prefer **per-character gradient**, **wrapper without clip**, or **solid fill + shadow** for animated spans so E2E and users see letters throughout the stagger.

**Rationale:** Known failure mode from post-implementation analysis; FR-007 requires visible stagger, not only DOM spans.
