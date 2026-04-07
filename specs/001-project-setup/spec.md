# Feature Specification: Project Setup

**Feature Branch**: `001-project-setup`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "Project Setup"

## User Scenarios & Testing *(mandatory)*

**Constitution (this repository):** User-visible strings MUST be **English**. Each user story MUST include a **Playwright coverage** subsection: list the planned spec file path (e.g. `e2e/<story>.spec.ts`) and which acceptance scenarios it exercises. Vitest covers pure logic/components as needed. When UI is designed with **MCP Stitch**, link or reference the Stitch output in the spec or plan.

### User Story 1 - First-time developer bootstrap (Priority: P1)

A new contributor clones the repository and, using only documentation in the repo, installs dependencies and starts the application. They see a minimal English shell (title and primary screen) confirming the project runs locally without additional unpublished steps.

**Why this priority**: Without this, no other feature work or review is possible; it is the minimum viable onboarding path.

**Independent Test**: Follow README from a clean clone on a supported machine; the application starts and the shell is visible in a browser without errors blocking the view.

**Playwright coverage**: `e2e/project-setup/bootstrap.spec.ts` — exercises acceptance scenarios 1–2 below (load shell, English copy visible).

**Acceptance Scenarios**:

1. **Given** a fresh clone and supported runtime as documented, **When** the contributor runs the documented install and start steps, **Then** the application serves a root page without startup-blocking errors.
2. **Given** the running application shell, **When** the contributor opens the root URL in a browser, **Then** user-visible text on the shell is in **English**.

---

### User Story 2 - Repeatable automated checks (Priority: P2)

A contributor runs a documented sequence of automated checks: fast logic-level checks first, then a production-like build, then full-browser checks against that build. The same sequence is intended to run in hosted continuous integration so local and remote results stay aligned.

**Why this priority**: Confirms quality gates required by project governance and gives reviewers confidence without manual ad-hoc testing.

**Independent Test**: From an installed workspace, run the documented automation sequence end-to-end; all steps exit successfully.

**Playwright coverage**: `e2e/project-setup/quality-gates.spec.ts` — exercises acceptance scenarios 1–2 below (preview build reachable, smoke assertion on shell).

**Acceptance Scenarios**:

1. **Given** an installed workspace, **When** the contributor runs the documented fast checks, **Then** all complete with success status.
2. **Given** an installed workspace, **When** the contributor runs the documented build then serves a preview of that build and runs full-browser checks, **Then** those checks complete with success status.

---

### User Story 3 - Installable and offline-ready shell (Priority: P3)

After a successful first online visit, the user can install the web application to their device home screen (where the platform supports it) and reopen the shell when offline, demonstrating the offline-first foundation for the future game.

**Why this priority**: Establishes PWA behavior early per product constitution; can ship after P1/P2 without blocking basic development.

**Independent Test**: First load online, then simulate offline (or use platform tools) and reopen; shell still loads. Install prompt or installed icon behavior verified per platform capability.

**Playwright coverage**: `e2e/project-setup/pwa-shell.spec.ts` — exercises acceptance scenarios 1–2 below (service worker registered or equivalent; offline revisit serves shell).

**Acceptance Scenarios**:

1. **Given** a first successful online load of the application, **When** the user returns with no network, **Then** the English shell still loads from cached assets (core navigation not blocked).
2. **Given** a supported browser or device, **When** the user chooses install/add-to-home-screen where available, **Then** the installed entry opens the same English shell.

---

### Edge Cases

- Unsupported or undocumented runtime version: documentation states required versions; user sees a clear failure message or documented workaround pointer.
- Partial install (interrupted download): user can retry install without manual cache surgery beyond standard documented steps.
- First visit offline: user cannot complete bootstrap without an initial online session to obtain assets; behavior is documented.
- Hosted automation environment differs from laptop: pipeline uses the same ordered steps as README (fast checks → build → preview → browser checks).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST include root-level documentation describing how a new contributor obtains a runnable application from a clean clone.
- **FR-002**: The application MUST expose a root experience with **English** user-visible copy for the setup milestone (shell or placeholder).
- **FR-003**: The repository MUST define repeatable commands (or equivalent) for fast automated logic-level checks and for full-browser checks.
- **FR-004**: Full-browser checks MUST run against a **production-like build served via preview**, not against a live-reload development server.
- **FR-005**: Hosted continuous integration MUST run the same ordered automation as documented locally: fast checks, then build, then preview, then full-browser checks, when CI is enabled for the repository.
- **FR-006**: The application MUST register offline support such that, after one successful online load, the shell remains reachable without network (cached shell).
- **FR-007**: Where the platform supports installable web apps, the application MUST be installable to the device home screen or equivalent.
- **FR-008**: Project documentation MUST state the non-commercial recruitment context and the provenance of bundled game imagery when imagery ingest is part of setup (one-time catalog-to-static pipeline), without claiming third-party endorsement.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new contributor completes local bootstrap using only repository documentation in **20 minutes or less** on a typical broadband connection (excluding download time variability).
- **SC-002**: **100%** of documented automation steps succeed on a clean CI run when CI is configured.
- **SC-003**: After first online load, **100%** of verification runs (sample of three consecutive offline revisits in test) successfully show the English shell without network.
- **SC-004**: **90%** of trial contributors in a hiring review can start the app and run the full automation sequence without asking for undocumented secrets or private services.

## Assumptions

- Target users for this feature are **developers and hiring reviewers**, not end players; the shell may be minimal until game features land.
- A supported Node.js version (or equivalent) is available locally and in CI; exact versions appear in technical planning, not in this spec.
- First-time asset download for gameplay imagery may use a documented one-time ingest; runtime gameplay does not depend on live external image hosts after setup.
- English is the only required UI language for the setup milestone.
- Stitch or other design outputs may refine visuals later; setup may use a neutral placeholder shell.
- **Constitution Principle IV (offline core game loop):** This feature delivers an **offline-capable shell** only. Satisfying “core game loop works offline” is **explicitly deferred** to the feature that implements the playable memory board; see [plan.md](./plan.md) Complexity Tracking.

### Note on US3 installability (FR-007)

Automated E2E reliably covers **service worker registration** and **offline reload**. **Add-to-home-screen / installed app** behavior varies by platform; it is validated by **manual smoke** steps in README and [quickstart.md](./quickstart.md), not required in Playwright for this milestone.
