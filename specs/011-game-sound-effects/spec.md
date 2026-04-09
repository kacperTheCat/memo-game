# Feature Specification: Game sound effects

**Feature Branch**: `011-game-sound-effects`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Sound fx's — based on bundled audio: click for every button (base component level); fail when wrong pair matched; success when correct pair matched; flip on tile flip (to show image); terrorist-win / counter-terrorist-win on game win (random sound)."

## Clarifications

### Session 2026-04-09

- Q: Which browser audio playback approach should implementation use? → A: **Web Audio API** as the primary path, with **HTML `<audio>`** (or equivalent element-based playback) as fallback for older browsers or when programmatic audio is unavailable.
- Q: Must **Configure New Game** (home hub) and **Unlock showcase** share the same base component, and should **Select Difficulty** play a click? → A: They do **not** need to be the same Vue component; both are **primary CTAs** and MUST play the **same short click cue** as other UI clicks (via the shared audio helper). **Briefcase difficulty** controls (the selectable difficulty cards / radio group) MUST also play that **same click** on each user activation that selects or changes difficulty.

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

### User Story 1 - Gameplay audio feedback (Priority: P1)

While playing a memory round, the player hears immediate audio when tiles reveal, when two tiles match or do not match, and when the round is won.

**Why this priority**: Gameplay sounds are the core emotional and informational feedback loop for the match mechanic and completion moment.

**Independent Test**: Complete a short game flow (flip tiles, mismatch, match, win) with device audio enabled and confirm each step produces the intended sound without errors.

**Playwright coverage**: `e2e/game-sound-effects.spec.ts` — exercises acceptance scenarios 1–4 below. Assertions focus on stable UI behavior and optional instrumentation (e.g. verifying sound triggers were invoked) rather than speaker output.

**Acceptance Scenarios**:

1. **Given** a game in progress, **When** the player reveals a face-down tile (image becomes visible), **Then** a short flip sound plays once for that reveal.
2. **Given** two revealed tiles that do not form a pair, **When** the mismatch is resolved, **Then** a short “fail” or mismatch sound plays.
3. **Given** two revealed tiles that form a pair, **When** the match is confirmed, **Then** a short “success” sound plays.
4. **Given** the board is cleared (round won), **When** the win state is shown, **Then** one of two distinct win stings plays, chosen at random for that win event (terrorist-side win variant vs counter-terrorist-side win variant).

---

### User Story 2 - Consistent button clicks (Priority: P2)

Across the app, activating any standard button control produces a light click sound so taps feel consistent.

**Why this priority**: Reinforces polish and tactile feedback for navigation and dialogs after gameplay audio exists.

**Independent Test**: Navigate using primary buttons and CTAs (e.g. **Configure New Game** on home, briefcase **Unlock**, **Return** links, game chrome, dialogs) and **change difficulty** on the briefcase; with audio on, hear a click on each activation.

**Playwright coverage**: Same file `e2e/game-sound-effects.spec.ts` — exercises acceptance scenarios 5–6 (paths may include home → briefcase, briefcase interactions, and console cleanliness).

**Acceptance Scenarios**:

5. **Given** the home hub, **When** the user activates the **Configure New Game** primary CTA (navigation to the briefcase), **Then** a short click sound plays once, matching the same click cue used for other primary actions (this CTA is not required to be the same Vue component as **Unlock showcase**; both MUST use the shared click sound behavior).
6. **Given** the briefcase screen, **When** the user selects a difficulty option (the **Select Difficulty** / radio-card control group), **Then** a short click sound plays once per activation (same cue as other UI clicks).

---

### Edge Cases

- If the device is muted, volume is zero, or the browser blocks audio, the app MUST remain fully usable with no user-visible errors; sounds simply do not play.
- Rapid repeated actions (many flips or fast button taps) MUST NOT crash the app; overlapping short sounds are acceptable unless they cause noticeable performance issues.
- Win sound randomness applies per win event (each completed round may play either win variant; no requirement to alternate or avoid repeats across rounds).
- On browsers that only use the `<audio>` fallback, the same events MUST still trigger the same cues; degraded timing or mixing quality is acceptable if the app remains stable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST play a short flip sound when a tile transitions from face-down to face-up (image visible).
- **FR-002**: The product MUST play a short mismatch sound when the player selects two tiles that are not a pair and the game applies the mismatch outcome.
- **FR-003**: The product MUST play a short success sound when the player selects two tiles that are a pair and the game confirms the match.
- **FR-004**: On round win, the product MUST play exactly one win sting per win, chosen at random from two provided variants (terrorist-themed win vs counter-terrorist-themed win).
- **FR-005**: All primary **clickable** controls that behave like buttons or primary navigation CTAs MUST trigger a short click sound once per activation, including: (a) activations routed through **`AppButton`** / **`MemoSecondaryNavButton`** where used; (b) **styled `RouterLink` or native controls** used as the main CTA when they are **not** wrapped by those components (e.g. home hub **Configure New Game**); (c) briefcase **Unlock showcase** and equivalent primary actions. The cue MUST be the **same** short click asset in all these cases.
- **FR-005a**: On the briefcase, each user activation of the **difficulty selector** (radio / card group for easy / medium / hard) MUST trigger the **same** short click sound once per activation.
- **FR-006**: Sounds MUST use the bundled audio assets supplied for this feature (click, flip, success, fail, and the two win variants); filenames in the repository are the source of truth for which file maps to which cue.
- **FR-007**: Out of scope for this feature: user-facing volume control, mute toggle, or persistence of audio preferences (future work unless specified elsewhere).
- **FR-008**: Implementation MUST use the **Web Audio API** for playback where the browser supports it, and MUST fall back to **HTML `<audio>`**-based playback when needed for older browsers or missing API support; user-visible sound behavior (which cue plays when) MUST match the functional requirements above on both paths.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With device audio on and unrestricted, a tester can complete one full round and observe flip, mismatch, match, and win sounds each at least once when the corresponding events occur (100% of listed event types audible in a normal run).
- **SC-002**: With device audio on and unrestricted, a tester samples **at least five** distinct UI activations covering **AppButton** or **MemoSecondaryNavButton** where present, the home **Configure New Game** CTA, **briefcase Unlock**, and **at least one difficulty change** on the briefcase — each produces an audible click (100% of sampled activations).
- **SC-003**: Across ten completed wins in manual testing, both win variants are observed at least once (random selection is not stuck on a single variant).
- **SC-004**: With audio blocked or unavailable, the same flows complete with no error toasts, blank screens, or broken navigation (qualitative pass/fail).

## Assumptions

- Target assets are already present under the project’s public audio folder (including click, flip, success, fail, terrorist win, and counter-terrorist win clips).
- “Base component level” means a **single shared click-sound entry point** (e.g. one helper used by primitives and by one-off CTAs) so behavior stays consistent; **not** every primary control must be the same Vue component.
- Localization of spoken content in win stings is not required; clips are acceptable as-is for v1.
- No new persistence keys are required; this feature does not store user sound preferences in this version.
- Engineering stack for playback: Web Audio API first, HTML `<audio>` fallback for compatibility (per clarification session 2026-04-09).
