# Research: 009-abandon-game-dialog

## 1. Modal implementation: Vue + Tailwind only

**Decision:** Implement the overlay as a **Vue SFC** with **`Teleport to="body"`**, a **fixed inset-0** semi-transparent **backdrop** (`z-index` above game chrome, e.g. `z-50`), and a **centered panel** reusing memo palette classes (`bg-memo-bg` / glass-like border patterns seen on **`WinDebriefPanel`** and briefcase). **No new npm dependency** (no Headless UI / Radix) for v1.

**Rationale:** Keeps bundle and stack aligned with constitution **I**; two call sites do not justify a headless primitives library. Tailwind utility composition matches existing views.

**Alternatives considered:**

- **@vueuse/core** `onClickOutside` / focus utilities — optional later; not added solely for this dialog.
- **Native `<dialog>`** — uneven `showModal()` styling and Safari nuances; team already standardizes on Vue-controlled overlays.

## 2. Wiring `useBriefcaseNavigateToGame` without globals

**Decision:** Avoid a Pinia “dialog store” for v1. **`BriefcaseView`** owns dialog visibility and passes a **`confirmDiscardInProgress: () => Promise<boolean>`** (or `(message: string) => Promise<boolean>`) into **`useBriefcaseNavigateToGame({ requestConfirm })`** so the composable stays testable with injected doubles. **`GameView`** uses the same **`MemoConfirmDialog`** locally for abandon.

**Rationale:** Minimizes global state; call sites are exactly two; Promise-based confirm maps cleanly to “user clicked OK/Cancel”.

**Alternatives considered:**

- **Global event bus / provide-inject only** — harder to trace than an explicit function parameter.
- **Pinia store for `dialogOpen`** — more boilerplate for two buttons.

## 3. Blocking interaction behind the overlay

**Decision:** Backdrop **`pointer-events-auto`** covering the viewport; panel stops propagation on click. While open, **do not** navigate or flip tiles behind the dialog (backdrop absorbs clicks). Scroll: **`overflow-hidden` on `body`** optional if background scroll is distracting on mobile; prefer minimal change unless QA reports scroll bleed.

**Rationale:** Matches **FR-005** without altering canvas hit-testing internals.

## 4. Focus and ARIA (constitution: pointer-first)

**Decision:** Set **`role="dialog"`**, **`aria-modal="true"`**, **`aria-labelledby`** (title element id) and **`aria-describedby`** (body copy id). On open, **focus the primary dismiss-safe control** (Cancel) or first focusable—pick **Cancel** to avoid accidental double-submit on Enter where keyboard exists. On close, **return focus** to the element that opened the dialog (`document.activeElement` snapshot before open). **`Escape`** closes with **cancel** semantics.

**Rationale:** Low-cost improvement for keyboard users without claiming full WCAG audit; matches spec edge cases for keyboard-only clarity.

**Alternatives considered:**

- **Trap focus with tabbable** manual loop — implement only if time allows; v1 can document “Tab cycles within dialog” if straightforward, else defer.

## 5. Browser matrix (testing)

**Decision:** Align with repo practice: **latest Chromium**, **latest Firefox**, **Safari** on supported macOS/iOS for manual smoke; **Playwright** uses project config (Chromium primary; WebKit if enabled in config).

**Rationale:** Constitution browser targets; no change to CI matrix required for this feature alone.

## 6. Copy and actions

**Decision:** Reuse **`abandonGameConfirm`** and **`briefcaseUnlockAbandonInProgress`** verbatim. Buttons: **Cancel** (negative) and **Abandon** or **Continue** (affirmative)—labels must map clearly to spec (**FR-003**): e.g. **Cancel** + **Abandon game** for story 1; **Cancel** + **Continue** for story 2 (wording can mirror destructive vs proceed meaning).

**Rationale:** Spec assumes meaning preserved; explicit button labels reduce mis-tap vs generic “OK”.

## 7. Unlock showcase: when to prompt (post–2026-04-09 clarification)

**Decision:** **`useBriefcaseNavigateToGame.navigateToGame`** MUST call **`requestConfirm`** whenever **`gameSession?.status === 'in_progress'`**, before **`router.push({ name: 'game', ... })`**. Mismatch of difficulty/seed is **not** required. This replaces the earlier “mismatch-only” rule so **Unlock** never silently resumes the same in-progress board.

**Rationale:** Spec **FR-002** and **Clarifications** — user expects **Unlock** to mean “start from Briefcase” = **new** deal after explicit abandon, even when hub settings match the current session.

**Copy:** Use **`briefcaseUnlockAbandonInProgress`** when difficulty or Briefcase seed field differs from the in-progress session. When they **match**, use either the same string (acceptable if it mentions statistics/outcome) or a dedicated shorter line (e.g. “Abandon current game and start a new deal with these settings?”) in **`appCopy.ts`** — spec allows one or two messages.

**Alternatives considered:**

- Keep mismatch-only — **rejected**; violates clarified **FR-002** and scenario **5**.
