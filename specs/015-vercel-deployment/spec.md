# Feature Specification: Hosted deployment and hidden game debug control

**Feature Branch**: `015-vercel-deployment`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Deployment — hide debug show-face button (game) for all non-local environments; deploy the app to Vercel."

## Clarifications

### Session 2026-04-09

- Q: What deployment shape is in scope for Vercel? → A: **SPA only** — static client bundle (built Vue/Vite app); no server-rendered HTML for routes as the primary delivery mode and no co-deployed backend API or database as part of this feature.

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

### User Story 1 - No cheat-style debug control on hosted builds (Priority: P1)

Someone opens the memory game from a **hosted** address (for example a shared preview link or the public site). They use the same screens as always, but they **do not** see or use the developer-only control that reveals every tile face at once (the “show all faces” / debug peek control on the game screen).

**Why this priority**: Prevents trivial cheating and avoids exposing internal tooling to real players or reviewers on shared URLs; reduces reputational and fairness risk.

**Independent Test**: Open the game on a hosted build and confirm the debug face control is absent from the interface while normal play (flip, match, win flow) still works.

**Playwright coverage**: Path: `e2e/game-debug-peek-visibility.spec.ts` (new) or an extension of an existing game-shell spec; maps to scenarios 1–2 below. Vitest: any pure helper that classifies “local vs hosted” context, if extracted.

**Acceptance Scenarios**:

1. **Given** the application is served from a **non-local** environment (any deployment URL, including preview), **When** a user views the game screen during normal play, **Then** the debug control that toggles showing all tile faces is not visible and cannot be activated through the normal UI.
2. **Given** the application is served from a **local development** context (as defined in Assumptions), **When** a developer opens the game screen, **Then** the debug face toggle remains available for legitimate local testing and existing automated tests that rely on local behavior can still be satisfied.

---

### User Story 2 - Shareable live SPA on managed hosting (Priority: P2)

Stakeholders and players can open the current build of the product as a **single-page application** (static assets + client-side routing) in a browser using a normal **HTTPS** link, without cloning the repository or running a server on their own machine. Updates flow from the team’s integration process to that hosting so “latest main” (or the agreed branch) is what people hit by default.

**Why this priority**: Unlocks demos, QA on real URLs, and real-world PWA/offline behavior checks; completes the deployment slice after P1.

**Independent Test**: Visit the agreed production (and, if used, preview) URL on a clean device profile; confirm the app loads, routes work, and core gameplay is usable.

**Playwright coverage**: Existing navigation and gameplay specs continue to run against **local preview** in CI; add or extend a lightweight **smoke** check against a **deployed preview URL** only if the plan adopts an optional job with a configured base URL (documented in plan). Maps to scenarios 1–2 below.

**Acceptance Scenarios**:

1. **Given** a successful integration of this feature, **When** a stakeholder opens the agreed **public** HTTPS URL, **Then** the application loads and the primary routes (home, game, briefcase) are reachable without local setup.
2. **Given** the team uses **preview deployments** for branches or pull requests, **When** a reviewer opens the preview link, **Then** they get a working instance of the app that honors Story 1 (no debug face control on that non-local URL).

---

### Edge Cases

- **Branch / PR preview URLs**: Treated as non-local; the debug face control MUST remain hidden.
- **Local E2E and developer workflows**: Must remain viable; hiding the control applies only to non-local serving contexts.
- **Misclassified environment**: If a build were accidentally tagged as “local” when served publicly, the debug control could leak — mitigation is a correct, reviewed classification rule and automated checks on a preview URL.
- **SPA routing**: Direct navigation or refresh on deep links (e.g. `/game`, `/briefcase`) MUST still load the app shell; hosting MUST be configured so the static SPA entry is served for those paths (no reliance on a server generating per-route HTML for this feature).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: For every **non-local** serving context, the game screen MUST NOT present the user-visible debug control that reveals all tile faces at once (including any equivalent control renamed but with the same purpose).
- **FR-002**: For **local development** serving contexts, the product MUST retain the ability to expose that same debug control for developers and automated tests, unless a future feature explicitly removes it project-wide (out of scope here).
- **FR-003**: The product MUST be **deployed** to the team’s managed hosting as a **static SPA** (built client assets only) so it is reachable at stable HTTPS URLs for production and, if enabled, preview deployments.
- **FR-003a** *(scope boundary)*: This feature does **not** include deploying a **server-rendered** version of the app, a **separate backend API service**, or **server-persisted** game state; gameplay and persistence remain **client-only** as today.
- **FR-004**: Deployed builds MUST behave consistently with existing game rules, navigation, persistence, and PWA expectations except for intentional differences required by FR-001.
- **FR-005**: Automated tests MUST be updated or added so that visibility of the debug face control matches FR-001 and FR-002 (e.g. assertion absent on hosted preview in an optional job, and present or unchanged locally as applicable).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On **100%** of manual checks (or automated checks, if implemented) against **non-local** deployment URLs, the debug “show all faces” control is **not** discoverable in the game UI through normal interaction.
- **SC-002**: **100%** of stakeholders attempting to open the agreed **public** URL from a standard browser on a network that allows HTTPS reach the home screen without needing local installation steps, and can use **client-side navigation** to other primary routes without requiring a separate server application beyond static hosting.
- **SC-003**: At least **one** successful **preview** deployment workflow completes for a merge candidate, and the resulting URL satisfies SC-001 for that environment.
- **SC-004**: Existing **local** developer and CI preview (local server) test suites remain **green** after the change, or failures are resolved before merge per project policy.

## Assumptions

- **“Local”** means the application is served for development on the developer machine using typical local origins (e.g. loopback hostnames and ports used by the project’s dev server). **“Non-local”** means any other origin, including production and all hosted preview URLs.
- **Hosting provider** for this feature is **Vercel**, including production and preview deployments as configured by the team; DNS and project naming are decided during planning, not in this spec.
- **Deployment artifact** is the **Vite production build** (static files under the project’s output directory, e.g. `dist/`): **SPA only**, suitable for static hosting and the existing **PWA** service worker; not a Node server process as the runtime for page HTML.
- The hidden-element data hooks used by automated tests today may remain in the DOM for testability where they are not player-visible controls; FR-001 targets the **cheat-style toggle control**, not necessarily every internal test attribute (exact boundaries for ancillary debug surfaces are decided in plan if needed).
- Continuous integration may continue to run Playwright primarily against a **local** or **CI-built** preview server; an additional check against a **remote** preview URL is optional unless the plan mandates it.
