# Research: 013 layout refactor & visual E2E

## 1. Game layout imbalance (canvas too far right)

**Decision**: Treat the issue as **shell/CSS alignment** first: inspect `GameView.vue` (and any parent route layout) for asymmetric flex/grid, `margin-left: auto` patterns, or max-width containers that pin content to one side. Prefer **symmetric horizontal centering** of the main game column (`max-w-[min(100%,1200px)]` + `mx-auto` or equivalent) and verify **header** and **main** share the same horizontal alignment axis.

**Rationale**: Constitution keeps gameplay on canvas; shifting perceived balance is usually DOM layout, not canvas drawing math. `GameView` already uses `self-center` on the header and `items-center` on `main`; any drift likely comes from inner `GameCanvasShell` wrappers or canvas sizing—confirm with Playwright **bounding box** assertions before changing `canvasLayout` math.

**Alternatives considered**: Changing board drawing origin inside canvas (rejected as first step—increases risk and does not fix DOM chrome alignment); new breakpoint-specific component (only if CSS-only fix insufficient).

## 2. Playwright visual regression (“basic” per screen)

**Decision**: Use **`expect(locator).toHaveScreenshot()`** (or full-page if needed) with **fixed viewport** matching `playwright.config.ts` default (`Desktop Chrome` device from Playwright). Store snapshots beside specs (default Playwright layout: `e2e/...-snapshots/`). Stabilize **game** screen with **`/game?difficulty=medium&seed=111222333`** (nine-digit seed per existing deal rules) so tile faces are deterministic.

**Rationale**: Project already uses Playwright 1.49 with `devices['Desktop Chrome']` and preview server; screenshot API is the standard approach. Seeded URL matches existing `GameView` query handling.

**Alternatives considered**: Pixelmatch custom harness (more code); Percy/third-party (out of scope for “basic” tests).

## 3. Flake control (animations, fonts, timing)

**Decision**: Before screenshots, **wait for known stable selectors** (e.g. `data-testid` on canvas shell root or route-ready markers). Use **`page.waitForTimeout` only as last resort**; prefer `expect(...).toBeVisible()` and idle network if needed. Document **`prefers-reduced-motion`** if animations affect snapshots; if flaky, set reduced motion in test context or wait for animation end via existing test hooks.

**Rationale**: Spec edge cases call out animations; project already exposes debug/meta test ids on game (`game-canvas`, `game-grid-meta`, etc.).

**Alternatives considered**: Disable all CSS transitions globally in test (might hide real bugs—use sparingly).

## 4. CI pipeline

**Decision**: **No workflow change required** if new specs are picked up by root `playwright.config.ts` (`testDir: 'e2e'`). Current `.github/workflows/ci.yml` already runs `pnpm exec playwright test` after Vitest. If visual snapshots are large, monitor artifact upload limits; keep screenshots **scoped** (single viewport, cropped locator).

**Rationale**: FR-005 satisfied by existing job order (Vitest → Playwright with embedded build+preview).

**Alternatives considered**: Separate `visual` job (only if runtime or artifact size forces split).

## 5. Refactor scope (components / composables / utils)

**Decision**: Use a **checklist-driven** pass: duplicate helpers → consolidate into `game/` or `composables/`; rename locals only when clarity improves API; break coupling by **injecting pure functions** or moving side-effect-free logic to `game/*`. Avoid wide re-exports; preserve public behavior covered by existing Vitest and E2E.

**Rationale**: Spec FR-003 is qualitative; bounded refactor with green tests is the safest interpretation.

**Alternatives considered**: Large-scale architectural rewrite (out of spec scope).

## 6. Browser matrix (local vs CI)

**Decision**: **CI**: Chromium only (matches current `playwright install --with-deps chromium`). **Local optional**: Firefox/WebKit for debugging layout; visual baselines **authoritative on Chromium** to match CI.

**Rationale**: Matches existing `ci.yml`; avoids multi-engine snapshot duplication in v1.

**Alternatives considered**: Multi-browser snapshot matrix (defer unless product asks).
