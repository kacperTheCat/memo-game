# Feature Specification: Abandon confirmation app dialog

**Feature Branch**: `009-abandon-game-dialog`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Create app dialog — Instead of system alert when user abandon game, create an app dialog. Styles should be consistent with other UX/styles in app."

## Clarifications

### Session 2026-04-09

- Q: When the user clicks **Unlock showcase** and a game is already **in progress**, should the app treat that as starting a **new** game from the Briefcase (not continuing the same in-progress match), and always show the confirmation dialog in that case? → A: **Yes.** Any **in-progress** session + **Unlock showcase** MUST show the in-app confirmation dialog. Confirming abandons the current match and starts a **new** game using the current Briefcase settings (fresh deal). This MUST NOT silently resume the previous in-progress board without confirmation. **Return to Game** (resume) remains a separate control and does not use this Unlock-showcase confirmation pattern.

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

### User Story 1 - Confirm abandoning an in-progress game (Priority: P1)

While playing, the user chooses an action that would leave the match and record the session as abandoned (for example returning to the briefcase from the game). The product shows an in-app confirmation layer that matches the app’s established look and feel. If the user confirms, the session is abandoned and navigation proceeds as today. If the user cancels, they remain in the game with no state change beyond closing the dialog.

**Why this priority**: This is the primary “abandon game” path and directly replaces the disruptive system-style prompt the user called out.

**Independent Test**: From an in-progress game, trigger leave/abandon; verify only the in-app dialog appears, and that confirm vs cancel each produce the correct outcome without a native browser confirmation for this flow.

**Playwright coverage**: Path: `e2e/abandon-confirmation-dialog.spec.ts`; exercises User Story 1 acceptance scenarios 1–3 below.

**Acceptance Scenarios**:

1. **Given** an in-progress game, **When** the user initiates abandoning/leaving to the briefcase, **Then** an in-app confirmation dialog appears (not a browser-native confirmation) and its visuals align with the app’s existing panels, typography, and button treatments.
2. **Given** the abandon confirmation dialog is open, **When** the user chooses to cancel or dismiss without confirming, **Then** the dialog closes, the game remains in progress, and the user is not navigated away.
3. **Given** the abandon confirmation dialog is open, **When** the user confirms abandonment, **Then** the session is finalized as abandoned, persisted behavior matches current product rules for abandoned outcomes, and the user is taken to the briefcase (or equivalent target) as today.

---

### User Story 2 - Confirm abandoning in-progress play when using Unlock showcase (Priority: P2)

From the briefcase, the user clicks **Unlock showcase** to start a game from the current Briefcase configuration. If a session is already **in progress**, that action means starting a **new** game (a fresh deal from the current difficulty and seed settings), **not** silently continuing the existing in-progress match. The product MUST show the same in-app confirmation dialog pattern as User Story 1 whenever **Unlock showcase** is used while a game is in progress—including when Briefcase settings **match** the in-progress session (user must still confirm before the old match is replaced). Confirming abandons the in-progress session and navigates to `/game` to start that new deal; canceling leaves the user on the briefcase with the in-progress session unchanged. **Return to Game** remains the path to resume the current match without this Unlock-showcase confirmation.

**Why this priority**: Ensures **Unlock showcase** never implies “resume same board without asking”; aligns hub behavior with user expectation of a deliberate new start.

**Independent Test**: With an in-progress session, click **Unlock showcase** with both matching and conflicting Briefcase settings; verify the dialog appears in both cases, and confirm/cancel outcomes (new deal vs no change) without a native browser confirmation.

**Playwright coverage**: Path: `e2e/abandon-confirmation-dialog.spec.ts`; exercises User Story 2 acceptance scenarios 4–6 below.

**Acceptance Scenarios**:

4. **Given** an in-progress session and Briefcase settings that **do not match** the in-progress deal (for example different difficulty or seed), **When** the user clicks **Unlock showcase**, **Then** the in-app confirmation dialog appears with messaging appropriate to abandoning the in-progress match for a new game, styled consistently with User Story 1.
5. **Given** an in-progress session and Briefcase settings that **match** the in-progress deal, **When** the user clicks **Unlock showcase**, **Then** the in-app confirmation dialog still appears (user must confirm before the current match is discarded for a **new** deal with the same settings).
6. **Given** that dialog is open, **When** the user cancels, **Then** no navigation to the game occurs and the in-progress session remains in progress; **When** the user confirms, **Then** the prior session is abandoned per existing rules and a **new** game starts from the current Briefcase settings (not silent resume of the previous board state).

---

### Edge Cases

- Dialog is open and the user activates the platform “back” gesture or hardware back (if applicable): behavior should match the app’s existing pattern for dismissing overlays (prefer equivalent to cancel unless product already defines otherwise).
- Rapid double activation of the control that opens the dialog: only one dialog instance is shown; no duplicate stacked confirmations.
- Screen readers and keyboard-only use: dialog is reachable, action labels are clear, and a primary vs destructive/cancel action relationship is obvious (consistent with accessibility expectations elsewhere in the app).
- Very small viewports: dialog remains readable and tappable without clipping critical actions.
- User has in-progress game and uses **Return to Game** from the briefcase: no Unlock-showcase dialog; session resumes as defined elsewhere (not the same code path as **Unlock showcase**).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: For abandoning an in-progress game from the game experience (User Story 1), the product MUST present an in-app confirmation dialog instead of a browser-native confirmation dialog.
- **FR-002**: For **Unlock showcase** (starting a game from the Briefcase) while a session is **in progress** (User Story 2), the product MUST present the same category of in-app confirmation dialog instead of a browser-native confirmation dialog—**whether or not** Briefcase difficulty/seed match the in-progress session. After confirm, the product MUST start a **new** game from the current Briefcase settings (fresh deal), not silently resume the prior in-progress board without this step.
- **FR-003**: The dialog MUST present a clear affirmative action (confirm abandon / proceed) and a clear negative action (cancel / stay), using English copy that preserves the meaning of existing abandon warnings (outcome recorded for statistics where applicable).
- **FR-004**: Visual design of the dialog (container, typography, spacing, buttons) MUST be consistent with other primary UI surfaces in the app (home, game shell, briefcase)—not a generic unstyled system look.
- **FR-005**: Until the user chooses an action, underlying gameplay or briefcase interactions that should not proceed MUST remain blocked in line with current safety semantics (no accidental navigation behind the dialog).
- **FR-006**: Canceling or dismissing the dialog MUST leave session and navigation state unchanged relative to the moment before the dialog opened (aside from focus/UI chrome).

### Out of scope

- Browser “leave site?” or tab-close warnings; adding or changing those behaviors is not part of this feature.
- Changing the statistical definition of “abandoned” or persistence schema beyond what is required to keep current behavior after confirm.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual or automated end-to-end checks for User Stories 1 and 2, no browser-native confirmation dialog is shown for the covered abandon or Unlock-showcase flows (100% of defined scenarios), including Unlock with **matching** Briefcase settings while in progress.
- **SC-002**: In a structured UX review against three reference screens (home, active game frame, briefcase), the dialog is rated as visually consistent with app patterns on at least typography, button style, and background/contrast (binary pass/fail checklist).
- **SC-003**: At least 90% of participants in informal hallway testing (or equivalent single reviewer sign-off for a solo team) successfully identify which control abandons vs cancels on first exposure without mis-tapping in a single short session (target: small sample, n≥3 if multiple testers available).
- **SC-004**: Dialog interaction (open → confirm or cancel → expected route/state) completes without error in 100% of automated regression runs that include the new Playwright spec.

## Assumptions

- English copy for the Unlock-showcase dialog may use one message for all in-progress cases or differentiate mismatch vs “same settings, new deal”; stakeholders may adjust strings while keeping the meaning (abandon + new game, statistics where applicable).
- One shared dialog pattern may serve both User Story 1 and User Story 2 to guarantee consistency and reduce maintenance.
- Native browser `alert` / `confirm` / `prompt` are not required elsewhere for these two flows after this feature ships.
