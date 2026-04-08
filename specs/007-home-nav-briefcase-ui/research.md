# Research: Home & Navigation Layout Alignment (007)

**Spec**: [`spec.md`](./spec.md) | **Plan**: [`plan.md`](./plan.md) | **Date**: 2026-04-08

## 1. Return to Briefcase during in-progress play

**Decision:** On **active board** (`showDebrief === false`, `gameSession.status === 'in_progress'`), **Return to Briefcase** calls **`session.flushSave(play.memory)`** (or equivalent immediate persist) then **`router.push({ name: 'briefcase' })`** **without** **`clearSession`**, **`finalizeSession`**, or **`play.resetRound`**.

**Rationale:** Matches **FR-002**; **`localStorage`** snapshot remains under **`memo-game.v1.inProgress`**. **`router.beforeEach`** on **`/briefcase`** only clears when **`gameSession?.status === 'won'`** (`src/router/index.ts`), so **in_progress** navigation is safe.

**Alternatives considered:** Rely on debounced autosave only (rejected—risk stale board if user navigates within 300 ms); clear session on hub entry (rejected—contradicts spec).

## 2. Abandon Game during in-progress play

**Decision:** Keep existing semantics: **`finalizeSession('abandoned')`**, **`clearReloadNewGameDifficulty()`**, **`play.resetRound()`**, **`session.clearSession()`**, then **`router.push({ name: 'briefcase' })`**. Retain a **confirm** dialog for destructive abandon (current `window.confirm` pattern in **`GameView.vue`**) unless UX requests inline modal later.

**Rationale:** Matches **FR-003** and current **`GameView`** behavior; abandoned rows stay in **`completedSessions`** for stats while **history ledger** remains **won-only** per **006** **`research.md`** §3.

**Alternatives considered:** Silent abandon (rejected—too easy to mis-tap); navigate home (rejected—spec assumes briefcase hub).

## 3. Return to Game from hub routes

**Decision:** **`router.push({ name: 'game' })`** without running **`useBriefcaseNavigateToGame`’s** difficulty-mismatch abandon path **when the control is explicitly “Return to Game”** (resume). That composable remains for **Unlock Showcase** / **Configure** flows that **start or switch** a deal from the briefcase preset.

**Rationale:** **Return to Game** must resume the **current** in-progress session; the briefcase UI may show a **different selected difficulty** than the running session without implying abandonment on resume.

**Alternatives considered:** Reuse **`navigateToGame()`** unchanged (rejected—would confirm-abandon when hub difficulty ≠ running session); always reset settings from session on briefcase mount (optional polish—defer unless flaky).

## 4. Shared history ledger on Home vs Debrief

**Decision:** Extract a presentational component (e.g. **`SessionHistoryLedger.vue`**) that accepts **rows** (or reads **`useGameSessionStore().readCompletedList()`** internally) and renders the **same** table structure, **won-only** filtering, **newest-first** order, **empty state**, and **`data-testid`** hooks as **`WinDebriefPanel`** today (**`win-history-table`**, **`win-history-empty`** or aliased shared IDs—prefer **stable shared testids** like **`session-history-table`** with E2E updates). **`WinDebriefPanel`** embeds the component inside its right column; **`HomeView`** embeds it as main content below actions.

**Rationale:** Satisfies **FR-005** / **FR-007** with one source of truth for column semantics.

**Alternatives considered:** Duplicate markup (rejected—drift risk); drive home from a different query (rejected—spec requires parity with debrief ledger).

## 5. Secondary navigation icons (Material Symbols)

**Decision:** **`MemoSecondaryNavButton`** uses **`variant`**: **`'back' | 'forward' | 'dismiss'`** (extend from prior **`back` / `dismiss`** only). Each control root is a Tailwind **`group`** for hover motion. Icons are **Google Material Symbols Outlined**:

- **`back`**: `<span class="material-symbols-outlined mr-2 transition-transform group-hover:-translate-x-1" aria-hidden="true">arrow_back</span>` before label.
- **`forward`** (**Return to Game** on home + briefcase): same span classes but glyph **`arrow_forward`** and **`group-hover:translate-x-1`** (motion **right**).
- **`dismiss`**: glyph **`close`** (or **`cancel`** if closer visual match—prefer **`close`** per spec); optional subtle scale instead of translate if needed—default **`close`** + same **`mr-2`** pattern without conflicting motion.

Load font in **`index.html`**, e.g.  
`https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0`  
with **`&display=swap`**. Document **Google Fonts ToS** in this **`research.md`** or root **README**. For **PWA offline**, after first online load the service worker may precache the CSS/font responses, or self-host a **WOFF2** subset in **`public/fonts/`** if strict offline nav icons are required.

**Rationale:** Matches **spec Clarifications** (fourth bullet) and **FR-004** / **FR-007** / **FR-008**; single component for debrief, game chrome, home, briefcase.

**Alternatives considered:** Inline Heroicons SVG (superseded by Material clarification); ASCII glyphs (rejected).

## 6. Grain + palette for Home and Briefcase (debrief is reference bar)

**Decision:** **`HubGrainLayer`** (or successor) implements **navy/black base + SVG noise** for **`/`** and **`/briefcase`**. **Post-match debrief** on **`/game`** (**`WinDebriefPanel`** warm brown + **`.noise-bg`**) is the **reference bar** per **spec Clarifications**: in **design review**, tune **`HubGrainLayer`** **opacity**, **blend mode**, and **vignette** so grain **reads no weaker** than debrief (not necessarily identical hue—**FR-009** allows surface tuning—but **strength / legibility** must align). Prefer **sharing noise parameters** (e.g. same `feTurbulence` frequencies, adjusted opacity) between debrief and hub where feasible.

**Rationale:** Satisfies updated **FR-009** / **SC-004**; remains **PWA**-friendly (vector noise, no large textures).

**Alternatives considered:** Weaker hub grain vs debrief (rejected by clarification); CSS `filter: noise()` (not widely available); heavy PNG (deferred).

## 7. Playwright distribution

**Decision:** **New** **`e2e/game-view-chrome.spec.ts`** for **US1** (seeded game optional—may use in-progress injection via **`localStorage`** if faster). **New** **`e2e/home-hub-layout.spec.ts`** for **US2** / **US4** smoke. **Extend** **`e2e/briefcase-view.spec.ts`** for **US3** (remove expectations for **`nav-to-home`** / **`nav-to-game`** **`AppButton`** as primary chrome; add **`Return to Start Screen`** / **`Return to Game`** testids).

**Rationale:** Mirrors **spec** story mapping; keeps files under **~200** lines where possible.

**Alternatives considered:** Single mega-spec (rejected—harder failure diagnosis).

## 8. Browser matrix

**Decision:** **CI**: Chromium (Playwright). **Manual**: Firefox + Safari on **`pnpm preview`** for grain rendering and contrast spot-check.

**Rationale:** Same as **004** / **006** plans.

## 9. Configure New Game on Home (primary CTA)

**Decision:** **`HomeView`** **Configure New Game** uses **primary gold** styling (**`bg-memo-accent`**, same family as debrief **Play Again** / **`memo-accent`** tokens), **not** **`MemoSecondaryNavButton`**. **Return to Game** on home stays **secondary** (**`MemoSecondaryNavButton`**) per **FR-007** and clarifications.

**Rationale:** Spec explicitly splits CTA vs resume/configure entry.

**Alternatives considered:** Both actions secondary (rejected—contradicts clarification).
