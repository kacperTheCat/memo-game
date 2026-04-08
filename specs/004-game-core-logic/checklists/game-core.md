# Requirements Quality Checklist: Game Core Logic

**Purpose**: Unit tests for requirements writing—validate clarity, completeness, and consistency of `spec.md` (feature 004), not implementation behavior.  
**Created**: 2026-04-07  
**Feature**: [spec.md](../spec.md)  
**Plan (context)**: [plan.md](../plan.md), [data-model.md](../data-model.md)

**Defaults applied** (`$ARGUMENTS` empty): depth **Standard**; audience **PR reviewer**; focus **(1)** classical play + session metrics, **(2)** responsive layout, motion, and persistence.

---

## Requirement Completeness

- [ ] CHK001 Are win / end-of-round requirements stated explicitly (all pairs cleared), or only implied via “classical memory” and FR-001? [Completeness, Spec §FR-001, Assumptions]
- [ ] CHK002 Are requirements defined for starting a **new** round after a win (reset, discard snapshot, history append timing)? [Gap]
- [ ] CHK003 Is “abandon session” specified as in-scope, and if so, are its triggers and persistence rules documented? [Gap, Spec §Key Entities — “abandon if defined”]
- [ ] CHK004 Do requirements enumerate minimum fields for **completed** session records with enough precision for a future statistics feature (ordering, uniqueness)? [Completeness, Spec §FR-011, Key Entities]
- [ ] CHK005 Are requirements stated for **ordering or shuffling** of pairs at round start (fixed vs random), or is this intentionally left to product data only? [Gap, Assumption — tile library]

## Requirement Clarity

- [ ] CHK006 Is “ignore extra input until the current pair resolves” quantified with timing (immediate vs after animation), or is “resolves” left to interpretation? [Clarity, Spec §FR-002, User Story 1 scenario 5]
- [ ] CHK007 Is “1200px content width” anchored to viewport, container, or CSS pixel semantics consistently across layout requirements? [Clarity, Spec §FR-003, User Story 2 scenario 1]
- [ ] CHK008 Is “a bit of padding” expressed as a measurable minimum gap or proportional rule in requirements, or only as qualitative spacing? [Clarity, Spec §FR-004]
- [ ] CHK009 Is “180° rotation … pivot on the left” reconciled with observable “item hidden” so reviewers cannot misread axis vs hinge semantics? [Clarity, Spec §FR-005]
- [ ] CHK010 Is “parallax-style” bounded by concrete caps (displacement, velocity) in requirements, or only via SC-005 subjective observation? [Clarity, Spec §FR-006, Spec §SC-005]
- [ ] CHK011 Is “one tile-selection click” defined unambiguously for double-taps, ignored picks while locked, and matched removed cells? [Clarity, Spec §FR-007, Edge Cases]

## Requirement Consistency

- [ ] CHK012 Do User Story 1 acceptance scenarios align with FR-001/FR-002 without contradicting “removed from grid” vs “empty slot” interpretations? [Consistency, Spec §User Story 1, Spec §FR-001]
- [ ] CHK013 Are **Automated test scope** and **SC-001** consistent on what “full classical flows” means when e2e is single-tile-limited? [Consistency, Spec §SC-001, Clarifications, Automated test scope]
- [ ] CHK014 Do session **active** time rules in FR-009 match edge cases for minimize, blur, split-screen, and multi-window focus? [Consistency, Spec §FR-009, User Story 3 scenario 3]

## Acceptance Criteria Quality

- [ ] CHK015 Can SC-002’s “40% width reduction” and “standard mobile emulation presets” be applied without undefined baseline width? [Measurability, Spec §SC-002]
- [ ] CHK016 Is SC-004’s “95% of repeated trials” tied to defined test environments and exclusion rules for storage-disabled cases? [Measurability, Spec §SC-004]
- [ ] CHK017 Does SC-005 provide an objective minimum standard, or does it rely solely on subjective observation? [Measurability, Spec §SC-005]

## Scenario Coverage

- [ ] CHK018 Are **recovery** requirements documented after corrupted or partial snapshots (checksum, version mismatch), beyond “discard with message”? [Coverage, Gap, Edge Cases — storage]
- [ ] CHK019 Are **concurrent** interaction scenarios (rapid input, touch + pointer) addressed in requirements or explicitly excluded? [Coverage, Gap, Edge Cases]
- [ ] CHK020 Are **offline / PWA** behaviors for persistence and restore referenced where they affect session continuity? [Coverage, Gap — Constitution vs spec]

## Edge Case Coverage

- [ ] CHK021 Are requirements for **reduced motion** limited to parallax/rotation intensity, or should flip timing also be constrained? [Edge Case, Spec §Edge Cases — Reduced motion]
- [ ] CHK022 Is “tappable targets” on narrow widths tied to a minimum hit target requirement or platform-only language? [Edge Case, Clarity, Spec §Edge Cases — Extreme narrow widths]

## Non-Functional Requirements (requirements-on-requirements)

- [ ] CHK023 Are performance expectations for flip animation and parallax stated in the spec, or only in the plan—creating a spec/plan split reviewers should resolve? [Non-Functional, Traceability — Plan vs Spec, Gap]
- [ ] CHK024 Are privacy/storage expectations (what is stored, retention caps, user reset) specified at requirement level, or only implied by “local” persistence? [Completeness, Gap, Spec §FR-010–FR-011]

## Dependencies & Assumptions

- [ ] CHK025 Is the dependency on **existing difficulty rules** and **tile identity** from prior features documented with a concrete reference artifact? [Dependency, Assumption, Spec §Assumptions]
- [ ] CHK026 Are English-only strings required for **all** new user-visible text (including storage errors), with no unstated localization exception? [Consistency, Spec §Assumptions, Constitution]

## Ambiguities & Conflicts

- [ ] CHK027 Does the spec resolve whether **statistics-oriented** stored records may omit board layout, given FR-011 minimum fields? [Ambiguity, Spec §FR-011]
- [ ] CHK028 Is “same device profile” for restore defined in requirements, or only as an assumption open to browser privacy features? [Ambiguity, Assumption, Spec §Assumptions, Spec §FR-010]

## Notes

- Check items off as completed: `[x]`
- Findings may drive `/speckit.clarify` or spec edits; this list does not validate code.
