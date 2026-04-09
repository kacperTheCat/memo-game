# Feature Specification: Wrong-pair tile input during mismatch feedback

**Feature Branch**: `016-wrong-pair-tile-input`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Game mechanics improvements. When wrong pair is selected, the user cannot check the next tile until the animations finish. We need to keep animations and let the user click the next tile."

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

### User Story 1 - Continue playing without waiting for mismatch animation (Priority: P1)

After the player reveals two tiles that do not match, the game shows mismatch feedback (motion and/or sound). The player wants to keep playing immediately—selecting the next face-down tile—without being forced to wait until that mismatch feedback has fully finished.

**Why this priority**: This is the core frustration described: input feels unresponsive after a wrong guess and slows repeated play.

**Independent Test**: From a mid-game board with a known non-matching pair, reveal that pair and assert that another face-down tile can be activated before mismatch feedback completes, while the wrong pair’s feedback still runs to completion.

**Playwright coverage**: Path: `e2e/game-wrong-pair-input-during-animation.spec.ts`; maps to acceptance scenarios 1–3 below (and supports edge-case verification where automated timing allows).

**Acceptance Scenarios**:

1. **Given** two revealed tiles that are not a match and mismatch feedback is still in progress, **When** the player activates a different face-down tile that is allowed by the rules of play, **Then** that selection is accepted without requiring mismatch feedback to finish first.
2. **Given** a non-matching pair was just revealed, **When** mismatch feedback plays, **Then** the player-visible mismatch animation and sound behavior is not removed or shortened solely to meet this feature (feedback remains at least as clear as before this change).
3. **Given** repeated wrong pairs in one session, **When** the player continues selecting tiles, **Then** the game remains winnable and rules for matches, persistence, and completion behave consistently with the product’s existing behavior aside from the input gating change.

### Edge Cases

- The player activates several tiles in quick succession during ongoing mismatch feedback: game state stays consistent (no stuck face-up tiles, no skipped required flips, no false wins).
- The player tries to select a tile that is already matched or invalid under existing rules: the game rejects or ignores that input the same way it would when no animation is running.
- Accessibility: keyboard or pointer paths that already work for tile selection remain usable during mismatch feedback (no new exclusive dependence on timing alone).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: After a non-matching pair is revealed, the system MUST allow the player to make the next valid tile-selection input without waiting for mismatch feedback animations or timed delays tied only to that feedback to complete.
- **FR-002**: The system MUST preserve player-visible mismatch feedback (including motion consistent with the current design and existing sound cues where applicable) for wrong pairs; this feature MUST NOT remove mismatch feedback to unlock input.
- **FR-003**: Tile selection during ongoing mismatch feedback MUST follow the same game rules as outside that window (valid/invalid targets, matched tiles locked, win/loss progression unchanged except for removal of input blocking).
- **FR-004**: The system MUST avoid inconsistent or corrupted board state when input occurs while mismatch feedback is still running (including rapid input).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual or automated checks, after an incorrect pair is revealed, a valid next tile can be selected in every trial before mismatch feedback finishes, with no requirement to wait for that feedback to end first.
- **SC-002**: Stakeholder review or regression checks confirm mismatch feedback for wrong pairs remains clearly noticeable (animation and sound) compared to the pre-change behavior.
- **SC-003**: Automated playthrough or targeted tests show no new class of illegal states (e.g., wrong number of face-up tiles, incorrect match resolution) attributable to allowing input during mismatch feedback.

## Assumptions

- “Next tile” means the next **valid** tile interaction the rules already permit after a wrong pair (not a change to matching rules or difficulty).
- Scope is limited to **input gating** around mismatch feedback; broader animation or redesign of the board is out of scope unless required to satisfy FR-002–FR-004.
- Existing persistence, seeds, difficulty, and win flow continue to apply; this feature does not introduce new saved settings.
