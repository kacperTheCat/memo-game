<!--
Sync Impact Report
Version: (none) → 1.0.0 (initial ratification)
Modified principles: N/A (template placeholders → five named principles)
Added sections: Product, data, and platform boundaries; Specification, design, and quality gates (replacing generic SECTION_2/3 placeholders)
Removed sections: None
Templates: .specify/templates/plan-template.md ✅ | tasks-template.md ✅ | spec-template.md ✅ | checklist-template.md ✅
Follow-up: Link README to this constitution when README exists; exact browser versions live in plan.md/research.md.
-->

# CS2 Memory (Vue 3) Constitution

## Core Principles

### I. Vue 3, TypeScript, and standard tooling

The application MUST use **Vue 3** and **TypeScript** with **Vite**, **Vitest**, **Pinia**, and **Tailwind CSS**. Prefer the Composition API and typed modules for game logic and UI state. A plan MAY document a temporary exception with rationale; silent drift is not allowed.

**Rationale:** One stack keeps the recruitment exercise reviewable and aligns tooling with modern Vue practice.

### II. Canvas-first gameplay

The playable memory grid—tiles, flip/reveal animations, and hit testing—MUST be implemented on **HTML Canvas** with correct **pointer and touch** handling. A DOM/CSS grid of cards MUST NOT be the primary interactive game surface.

**Rationale:** Canvas matches the performance goal and a single render surface for the core loop.

### III. Performance

Interaction MUST remain smooth on target browsers and devices: bounded work per frame, avoid unnecessary full-canvas redraws, and load/decode images efficiently. Plans and specs MUST define measurable budgets where relevant (e.g. frame budget, input latency expectations).

**Rationale:** “Top notch” performance is enforced through explicit, checkable targets per feature.

### IV. Responsive web, PWA, and client-side state

Layout and input MUST work on **desktop and mobile**. The app MUST be a **PWA**: after the first successful load, the **core game loop MUST work offline**, and the app MUST be **installable** (add to home screen / installed PWA). Service worker and cache boundaries are defined per feature plan. **All** persistent game state (progress, settings, session restore) MUST remain on the client; the storage mechanism is specified in the plan.

**Rationale:** Recruitment demo reliability and explicit offline behavior; no server dependency for saved state.

### V. TDD and Playwright for user stories (non-negotiable)

Implementation MUST follow **TDD** (red–green–refactor). **Every user story** (P1, P2, …) MUST include **Playwright** end-to-end coverage mapped to its acceptance scenarios. Vitest covers unit and component logic as appropriate.

**Rationale:** Traceability from story to automated proof; matches the project’s quality bar.

## Product, data, and platform boundaries

This project is a **non-commercial recruitment / portfolio** exercise, not a production or commercial product. The README or spec SHOULD state that context.

The product is a **memory matching game** themed around **Counter-Strike 2**. Item metadata and image URLs originate from the unofficial **[ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API)** (MIT-licensed data project). Images MUST be **ingested once** (build-time or one-off script) and **shipped as local static assets** (e.g. under `public/` or bundled). The running game MUST NOT depend on live calls to CSGO-API or remote image hosts for core gameplay. Plans MUST document the ingest path, output locations, and **attribution** (source repository and license). CS-themed marks are third-party; this work does not imply endorsement.

**User-visible copy** MUST be **English**.

**Browser targets:** current **latest** releases and **current LTS / extended-support** channels of the dominant engines used in plans—typically **Chromium** (Chrome, Edge), **Firefox**, and **Safari** on supported OS versions. The exact matrix is recorded in `plan.md` / `research.md`, not duplicated here.

**Accessibility:** **Pointer-first** (mouse and touch). There is no constitution-level requirement for screen readers or a full WCAG audit unless this document is amended.

**Repository layout:** A **single** repository with **one** root `package.json`. **Vitest** and **Playwright** MUST be **colocated** (e.g. `src/**/*.spec.ts`, `e2e/` or `tests/e2e/`, `playwright.config.ts` at repo root). A separate repository or package dedicated only to E2E is NOT allowed unless a plan documents an approved workspace exception.

**Visual design tokens** (colors, typography, spacing): NOT governed here—use Stitch outputs, `tailwind.config` / CSS variables, plan/spec, or `docs/design.md`. Palette changes MUST NOT require a constitution amendment unless an external brand mandate is adopted by explicit amendment.

## Specification, design, and quality gates

Feature specifications MUST use **prioritized, independently testable user stories**. Each story MUST trace to **Vitest** and **Playwright** as appropriate. **MCP Stitch** SHOULD be used for visual/UI design when creating or revising UI; spec or plan SHOULD reference Stitch outputs so implementation matches agreed design.

Implementation plans MUST complete the **Constitution Check** before Phase 0 research and re-check after Phase 1 design. `/speckit.analyze` treats constitution violations as **CRITICAL**.

**Continuous integration:** When automated CI exists (e.g. GitHub Actions), it MUST run **Vitest before Playwright**, produce a **production build** (`vite build`), serve the app with **`vite preview`** (or equivalent), then run **Playwright** against that URL. Exact workflow YAML, runners, Node version, and caches belong in `.github/workflows/` and plan technical context—not in this constitution.

## Governance

This constitution supersedes conflicting ad-hoc practices for this repository. Amendments MUST be documented in this file with an updated **Last Amended** date and **Version** per semantic versioning: **MAJOR** for incompatible governance or principle removals/redefinitions; **MINOR** for new principles or materially expanded guidance; **PATCH** for clarifications and non-semantic edits.

Pull requests and reviews MUST verify compliance with these principles. Complexity that violates a principle MUST be justified in the plan’s **Complexity Tracking** table or rejected.

**Version**: 1.0.0 | **Ratified**: 2026-04-07 | **Last Amended**: 2026-04-07
