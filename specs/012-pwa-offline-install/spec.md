# Feature Specification: PWA offline persistence and install prompt

**Feature Branch**: `012-pwa-offline-install`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "PWA — save and read game state so when user refreshes the page, settings need to be saved (full offline behavior). Add a native-like PWA install bottom panel (similar in interaction pattern to https://khmyznikov.com/pwa-install/) but with our styles; the popup should appear once before the user installs or denies installation (save information on local device)."

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

### User Story 1 - Game state and settings survive refresh and work offline (Priority: P1)

A player can close or refresh the browser tab, lose network connectivity after the app has loaded, and still return to the same experience: in-progress rounds resume where they left off, and choices that affect how a new round is configured (such as difficulty) remain as last set by the player.

**Why this priority**: Reliability and “app-like” trust are the main reason to treat the product as a PWA; without durable state and offline use, install prompts add little value.

**Independent Test**: Start a round, make progress, change configuration on the briefcase, refresh or go offline, and confirm the board and settings match expectations without requiring a new network fetch for core play.

**Playwright coverage**: `e2e/pwa-persistence-offline.spec.ts` — exercises acceptance scenarios 1–4 below (persistence may be asserted via UI state and optional storage inspection helpers consistent with existing e2e patterns).

**Acceptance Scenarios**:

1. **Given** an in-progress round with known revealed and matched pairs, **When** the player reloads the page and returns to the game, **Then** the same round state is restored (matched pairs stay matched, unmatched flips follow the product’s normal resume rules).
2. **Given** the player has selected a difficulty (or equivalent pre-game setting) on the briefcase, **When** they navigate away and later reload the app or open it again on the same device and browser profile, **Then** that setting is still selected before they start a new configured round.
3. **Given** the app has been fully loaded at least once with assets available, **When** the network is unavailable and the player opens a route that supports play, **Then** they can complete a memory round using cached shell and media without an online connection (qualitative: no blocking “cannot load” state for core play).
4. **Given** a completed round is recorded in the product’s history flow, **When** the player reloads, **Then** completed-session history behavior remains consistent with the product’s existing rules (no unintended loss solely due to refresh).

---

### User Story 2 - One-time, styled install invitation (Priority: P2)

When the browser supports installing the app to the device, the player sees a bottom-anchored panel that explains they can install for quicker access. The panel uses the same visual language as the rest of the product (not a generic system dialog skin). It appears at most once until the player either completes installation or explicitly dismisses the invitation; that outcome is remembered on the device so the same invitation is not shown again for that profile unless product rules define a reset.

**Why this priority**: Improves discovery of install without nagging; secondary to correct persistence and offline behavior.

**Independent Test**: Simulate or trigger install eligibility, observe the panel once, choose install or dismiss, reload, and confirm the panel does not reappear; reset only via clearing site data or documented dev-only reset if any.

**Playwright coverage**: `e2e/pwa-install-prompt.spec.ts` — exercises acceptance scenarios 5–8 below (where Playwright can drive or stub install events; scenarios that depend on unsupported browsers are marked optional in test plan).

**Acceptance Scenarios**:

5. **Given** install is available to the product, **When** the invitation is shown, **Then** it appears as a bottom sheet or panel anchored to the lower edge of the viewport with English copy and actions consistent with install vs dismiss.
6. **Given** the invitation has not been shown before on this device profile, **When** eligibility is met, **Then** the panel is shown exactly once for that cycle (first eligible presentation).
7. **Given** the player dismisses the invitation (deny / not now), **When** they reload or return later, **Then** the same invitation is not shown again automatically.
8. **Given** the player completes installation through the offered flow, **When** they use the installed entry point, **Then** the invitation is not shown again for that installed experience in normal use.

---

### Edge Cases

- Device or browser blocks storage: the product MUST degrade gracefully (game remains playable in-session; persistence and “remember dismiss” may be unavailable without crashing).
- User clears site data: persisted round, settings, and install-invitation memory are cleared together; behavior matches a first visit until they configure again.
- Browser does not expose install or never fires install eligibility: the invitation MUST NOT loop or error; it simply does not appear (or stays hidden).
- Already running as an installed app: the install invitation MUST NOT appear when the product detects it is already in standalone/display-mode appropriate for “installed.”
- Private or ephemeral profiles: same as storage-blocked — no repeated error states; optional one-time messaging is acceptable if consistent with product tone.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST persist in-progress game state so that a full page reload restores the round to the same recoverable state the product already defines for resumed play (matched tiles, progress, timers or move counts if applicable).
- **FR-002**: The product MUST persist player-configured pre-game settings (at minimum: selected difficulty; and any other briefcase-visible options that affect the next deal) across reloads and return visits on the same device browser profile.
- **FR-003**: The product MUST make core gameplay and required static media available without a live network connection after the user has successfully loaded the app at least once while online (full offline behavior for play and navigation between supported offline routes).
- **FR-004**: When the hosting environment supports adding the app to the home screen or equivalent install, the product MAY surface an in-product install invitation that follows a bottom-panel interaction pattern (sheet anchored to the bottom, primary install action, explicit dismiss).
- **FR-005**: The product MUST record on the user’s device whether the install invitation was dismissed or install was completed, and MUST NOT automatically show the same invitation again once one of those outcomes has been recorded (until site data is cleared or a future product version explicitly migrates that record).
- **FR-006**: User-visible strings for the install invitation MUST be in English and MUST match the product’s typography, spacing, and color patterns used elsewhere (native-like layout, application-owned styling).
- **FR-007**: The install invitation MUST NOT obscure safety-critical UI without a dismiss path; it MUST be dismissible without installing.
- **FR-008**: Out of scope for this feature: cross-device sync, account-based cloud save, changing persistence schema version (follow existing versioned persistence rules unless a separate migration feature is approved).

### Key Entities

- **In-progress session snapshot**: Represents the current board and progress so a reload can resume; extends the product’s existing notion of an in-flight game.
- **Player settings**: Difficulty and other briefcase-level choices that should survive refresh and new visits on the same profile.
- **Install invitation record**: A device-local flag or equivalent indicating whether the user has already been offered install and whether they dismissed or completed install, governing repeat display.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual or automated testing, after a mid-round reload, **100%** of checked board elements (matched pairs, face-up/face-down consistency per rules) match the pre-refresh state in **at least five** distinct trial reloads.
- **SC-002**: In manual or automated testing, after setting difficulty (or equivalent), closing the tab, and reopening on the same profile, the same setting is selected **without** the user re-selecting it in **at least five** consecutive trials.
- **SC-003**: With network disabled after initial online load, a tester completes one full round from open to win **without** loading errors that block input, in **three** consecutive trials on a supported desktop or mobile browser.
- **SC-004**: After the user dismisses or completes install from the invitation, **zero** automatic re-shows of the same invitation occur across **ten** subsequent reloads or revisits on the same profile (unless site data is cleared).
- **SC-005**: Qualitative review: the install invitation visually matches the application’s established UI style (spacing, type, buttons) and is clearly readable on small and large viewports.

## Assumptions

- “Full offline behavior” means offline-first for gameplay and shell after first successful online load; initial acquisition and updates still require connectivity at least once.
- Existing completed-session and in-progress persistence concepts remain authoritative; this feature extends durability to settings and aligns offline caching with those flows rather than replacing them.
- Reference UX for the install panel is behavioral (bottom sheet, explicit actions, one-time feel), not a pixel copy of third-party demos; visual design stays owned by this product.
- Seed or layout randomization that is intentionally ephemeral until a deal is locked may continue to follow existing product rules; anything the player must not lose on refresh is either in the snapshot or in persisted settings as defined above.
