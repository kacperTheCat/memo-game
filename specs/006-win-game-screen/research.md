# Research: Post-Match Win Screen (006)

**Spec**: [`spec.md`](./spec.md) | **Plan**: [`plan.md`](./plan.md) | **Date**: 2026-04-08

## 1. Route and navigation on win

**Decision (clarified 2026-04-08):** Stay on **`/game`**. On **`won`** in **`GameCanvasShell`**, after **`session.finalizeSession('won')`** and **`session.flushSave`**, set **parent / store UI mode** to **debrief** (e.g. `showDebrief` or derive from **`gameSession.status === 'won'`**). **Remove** immediate **`beginSession`** + **`startNewRound`** from the win branch; **Play Again** switches back to **board** mode and then runs **`beginSession`** + **`startNewRound`**. **No** **`router.push`** to a win path; debrief is **not** manually addressable.

**Rationale:** Matches clarified FR-001; users cannot bookmark a standalone win URL.

**Alternatives considered:** Separate **`/win`** route (superseded by clarification); modal-only overlay without route change (still valid as implementation detail—same URL either way).

## 2. Source of “just finished” summary vs refresh / deep link

**Decision (updated 2026-04-08, FR-013):** **While the SPA is alive:** If **`gameSession.status === 'won'`**, drive stat cards from **`activePlayMs`**, **`clickCount`**, **`difficulty`**. **Full page reload on `/game` while debrief was showing:** The product MUST **not** restore the debrief. After reload, **`/game`** MUST show a **new active game** at the **same difficulty** as the session that produced the debrief, with a **new randomized layout**—**equivalent to Play Again**. **Do not** persist a “debrief visible” flag in **`localStorage`/`inProgress`** that would re-show debrief without a fresh win. **Completed-session history** is unchanged (the won run stays in **`completedSessions`**).

**Implementation (shipped):** On **`won`**, **`GameView`** writes the round’s **`difficulty`** to tab-scoped **`sessionStorage`** under **`memo-game.v1.reloadNewGameDifficulty`** (`src/game/reloadNewGameDifficulty.ts`). After reload, **`GameCanvasShell` `initRoundIfNeeded`** **consumes** that key (once) to **`beginSession`/`startNewRound`** at that difficulty, then removes it. **Play Again**, **Return to Briefcase**, and the **`/briefcase` `router.beforeEach`** guard **clear** the key so it never leaks across flows.

**Rationale:** Spec **FR-013** / User Story 1 scenario 4; eliminates orphan debrief after refresh.

**Alternatives considered:** Restore debrief from snapshot (rejected—contradicts FR-013); show briefcase after reload (rejected—spec requires Play Again–equivalent on **`/game`**).

## 3. History ledger rows: won-only vs all completed

**Decision:** Display **only** **`outcome === 'won'`** in the four-column ledger. **Abandoned** sessions remain in **`localStorage`** for potential future use but do not appear in this table (spec table implies successful “operations”; avoids explaining abandoned rows without an Outcome column).

**Rationale:** Aligns with “post-match debrief” and Stitch sample rows; keeps columns to Date / Difficulty / Time / Moves only.

**Alternatives considered:** Show all outcomes with an extra column (deferred—out of spec); hide abandoned without policy (rejected—ambiguous).

## 4. Formatting rules

**Decision:** **Date:** calendar **`YYYY-MM-DD`** from **`completedAt`** in **local** timezone (or UTC consistently—pick **local** for player expectation; document in formatter tests). **Time:** **`MM:SS`** from **`activePlayMs`**, floor seconds, cap display for long runs (e.g. **99:59+** still valid). **Moves:** **`clickCount`**. **Difficulty:** map **`Difficulty`** union to **Easy / Medium / Hard** English labels and Tailwind chip styles mirroring Stitch (blue / purple / red family).

**Rationale:** Matches FR-006 and existing **`CompletedSessionRecord`** fields.

**Alternatives considered:** ISO date only in UI (rejected by spec).

## 5. Grain and liquid-glass styling

**Decision:** Implement **grain** with a **fixed full-viewport overlay** (low opacity) using **SVG `feTurbulence`** as a **data-URI** background or equivalent, per Stitch **`code.html`**. **Liquid glass:** **`backdrop-filter`** + semi-transparent background + thin light border + optional inset highlight on **stat cards** and **ledger** container; **Tailwind 4** arbitrary utilities or a small scoped CSS block in the view.

**Rationale:** Matches spec FR-010/FR-011 and exported design tokens (**primary** gold `#e5aa34`, dark background).

**Alternatives considered:** Heavy image texture asset (rejected—SVG noise is lightweight and offline-friendly).

## 6. Playwright strategy

**Decision (clarified 2026-04-08):** **Primary** proof is **`e2e/win-game-screen.spec.ts`** driving **`/game`** with a **fixed seed** (or equivalent) so the deal is **deterministic**, then executing **known pair clicks** until **win**, asserting debrief **`data-testid`**s, **ledger**, **Play Again** / **Return to Briefcase**. **Do not** navigate to an isolated win-only URL (none exists). **Supplementary:** Vitest covers **RNG/deal** with the same seed contract.

**Rationale:** Spec **FR-012**; stable automation without a cheat route.

**Alternatives considered:** **`localStorage` seed of completed list only** (insufficient for P1 full path); separate test-only win route (rejected by product clarification).

## 7. Browser matrix

**Decision:** Same as **004**: **CI** Chromium via Playwright; **manual** Firefox + Safari on **`pnpm preview`**.

**Rationale:** Consistent with existing plan.

## 8. In-progress snapshot when leaving debrief

**Decision:** **Play Again** switches UI to **board**, then **`beginSession`** + **`startNewRound`** as today (still on **`/game`**). **Return to Briefcase** uses **`router.push('/briefcase')`**; clear or normalize **`gameSession`** and **any debrief-only UI flags** so **`/game`** on next visit does not treat a **won** session as **in_progress** for **`flushSave`** and does **not** show debrief without a **new** win (**FR-014**).

**Rationale:** Prevents inconsistent **`flushSave`** behavior and orphan debrief after hub navigation.

**Alternatives considered:** Only clear on explicit Return control (rejected—**FR-014** requires any **`/briefcase`** entry to clear debrief mode).

## 9. Reload on debrief + briefcase clears win debrief state (FR-013 / FR-014)

**Decision:** **FR-013:** On **`/game`** mount after a full reload, **normalize** to a **new** **`in_progress`** session at the **same difficulty** as the debrief session (**`beginSession` + new deal**), using the **reload difficulty** handshake in §2 (not **`localStorage`**). **FR-014:** On **every** navigation that **commits** to **`/briefcase`** while **`gameSession.status === 'won'`**, **`router.beforeEach`** clears **`session.clearSession()`**, **`play.resetRound()`**, and **`clearReloadNewGameDifficulty()`** so the next **`/game`** visit does not revive debrief or stale canvas state.

**Rationale:** Matches **Clarifications** session 2026-04-08 and **SC-006** testability.

**Alternatives considered:** Persisting a “debrief visible” boolean (rejected—would fight FR-013); clearing debrief only when leaving **`/game`** (rejected—FR-014 names **`/briefcase`** as the hub that must reset state).
