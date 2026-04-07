---
name: Speckit Constitution Setup
overview: Replace placeholders in [.specify/memory/constitution.md](.specify/memory/constitution.md) with English principles for the CS2-themed Vue 3 memory game (non-commercial recruitment task), including one-time CSGO-API asset ingest to local static files, Canvas, performance, PWA/offline, browser targets, pointer-first a11y, mandated stack (Vite, Vitest, Pinia, Tailwind), TDD + Playwright, and design via MCP Stitch; ratify v1.0.0 and sync Speckit templates.
todos:
  - id: draft-constitution
    content: Write filled English constitution + HTML Sync Impact Report to .specify/memory/constitution.md (v1.0.0, 2026-04-07)
    status: completed
  - id: sync-plan-template
    content: Replace Constitution Check placeholder in .specify/templates/plan-template.md with project-specific gates (incl. PWA, browsers, API pipeline)
    status: completed
  - id: sync-tasks-template
    content: Make TDD + Playwright mandatory in .specify/templates/tasks-template.md (Vue/Vitest paths)
    status: completed
  - id: sync-spec-template
    content: Add Playwright traceability + English UI note to .specify/templates/spec-template.md
    status: completed
  - id: verify-cursor-commands
    content: Grep .cursor/commands/speckit.*.md for outdated references; patch only if needed
    status: completed
  - id: optional-checklist
    content: Add PWA/offline + performance + E2E reminders to checklist-template.md if minimal
    status: completed
isProject: false
---

# Speckit constitution for CS2 Memory (Vue 3)

## Context

Current file is still the generic template with tokens like `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]` through `[PRINCIPLE_5_NAME]`, `[SECTION_2_NAME]`, `[SECTION_3_NAME]`, `[GOVERNANCE_RULES]`, `[CONSTITUTION_VERSION]`, dates. No prior ratified version exists, so this is **initial adoption**: version **1.0.0**, **Ratified** and **Last Amended** = **2026-04-07** (per session date).

Requirements use **five principles** in the template, plus two sections and governance. **Approved stack and product decisions** (from user) are folded in below.

## Project intent

- **Purpose**: Non-commercial **recruitment / portfolio** exercise—not a production product or commercial deployment. Governance and risk language stay honest: principles still guide quality, but **README** (or spec) SHOULD state recruitment context and **one-time asset provenance** (see below).

## Repository architecture (app vs Playwright)

**Recommendation: one project, not two.** Keep a **single** repository with **one** root `package.json` (standard Vite + Vue template style):

- **Application**: `src/` (Vue 3, Canvas game, Pinia, Tailwind).
- **Unit / component tests**: Vitest, typically `src/**/*.spec.ts` or `tests/unit/`—as chosen in the first plan.
- **End-to-end tests**: Playwright as a **devDependency** in the **same** package, specs in e.g. `e2e/` (or `tests/e2e/`) and `playwright.config.ts` at repo root. CI runs `vite preview` or `dev` server + `playwright test`.

**Why not a separate “Playwright project” repo or package?** For a recruitment task it adds versioning and linking friction with little benefit. Reviewers expect `git clone` → `npm i` → `npm test` / `npm run test:e2e`.

**When a second package might make sense** (optional exception, document in plan if used): a **monorepo workspace** (`apps/web` + `e2e` as separate `package.json`) if the team already standardizes on pnpm/npm workspaces—still one git repo, not two independent projects. A **fully separate** E2E repository is **not** recommended here.

**Constitution wording (when executed)**: Section 2 or Technical Constraints SHOULD state **single deployable app repository** with **colocated** Vitest and Playwright unless a written plan exception applies.

## Locked product and platform decisions

- **Item/image pipeline**: Item metadata and image **URLs** originate from the unofficial **[ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API)** ([MIT license](https://github.com/ByMykel/CSGO-API/blob/main/LICENSE)). Images MUST be **ingested once** (e.g. build-time or one-off script) and **shipped with the app** (e.g. `public/` or bundled assets). The **running game MUST NOT depend** on live calls to CSGO-API or remote image hosts for core gameplay—this supports offline PWA and stable demos for reviewers. Plans MUST document the ingest script, output paths, and **attribution** (source repo + license note); CS-themed marks remain third-party; this is a hiring task, not a claim of endorsement.
- **UI language**: **English** only for user-visible copy.
- **Browsers**: Current **latest** releases and **current LTS / extended-support** channels of the most used engines (interpretation for plans: **Chromium** (Chrome/Edge), **Firefox**, **Safari** on supported OS versions—exact matrix in `plan.md` / `research.md`).
- **Accessibility scope**: **Pointer-first** (mouse and touch); no constitution-level requirement for screen readers or full WCAG audit unless amended later.
- **PWA**: After first successful load, the game **MUST** be usable **offline** for the core loop; the app **MUST** be **installable** (“add to home screen” / installed PWA). Service worker and cache boundaries defined per feature plan.
- **Tooling**: **Vite**, **Vitest**, **Pinia**, **Tailwind CSS** are approved defaults alongside Vue 3 + TypeScript.
- **Design**: Visual/UI design **SHOULD** be produced with the **Cursor MCP Stitch** server where applicable; specs or plan link or reference Stitch outputs so implementation matches agreed design.
- **Visual tokens (colors, typography, spacing scale)**: **Not** in the constitution—keep them in Stitch outputs, `tailwind.config` / CSS variables, feature **plan/spec**, or a small `docs/design.md`. Constitution stays for engineering and process rules; palette changes should not require a constitution amendment. Exception: only if an external party mandates a fixed brand system (unusual for this recruitment scope).

## Proposed principle set (English)


| #   | Working title                                  | Non-negotiables (summary)                                                                                                                                                                                                     |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Vue 3, TypeScript, and standard tooling**    | Application MUST use Vue 3 and TypeScript with **Vite**, **Vitest**, **Pinia**, and **Tailwind CSS** unless a plan documents a constitution exception with rationale.                                                         |
| 2   | **Canvas-first gameplay**                      | Playable memory grid (tiles, flip/reveal, hit testing) MUST be on **HTML Canvas** with correct pointer/touch handling—not a DOM grid of cards as the primary game surface.                                                    |
| 3   | **Performance**                                | Interaction MUST remain smooth on target browsers/devices: bounded work per frame, minimal unnecessary full-canvas redraws, efficient loading/decoding of images; measurable budgets in plan/spec per feature where relevant. |
| 4   | **Responsive web, PWA, and client-side state** | Layout and input MUST work on desktop and mobile; **PWA** MUST support **offline play after first load** and **installability**; **all** persistent game state MUST stay on the client (storage mechanism per plan).          |
| 5   | **TDD and Playwright for user stories**        | TDD (red–green–refactor) for implementation; **every user story** MUST have **Playwright** coverage mapped to acceptance scenarios.                                                                                           |


## Section 2 (e.g. “Product, data, and platform boundaries”)

- Memory game themed around **Counter-Strike 2**; card art from **one-time CSGO-API-derived** assets bundled locally (see pipeline above).
- **Recruitment / non-production** scope stated in project docs where helpful.
- **English** UI copy.
- **Browser** targets as in “Locked product and platform decisions.”
- **Accessibility**: pointer/touch interaction; no mandated screen-reader support in v1.

## Section 3 (e.g. “Specification, design, and quality gates”)

- Feature specs: prioritized, independently testable user stories; each story traces to **Playwright** and **Vitest** as appropriate.
- **Design**: use **MCP Stitch** for design work when creating or revising UI; reference outputs in spec/plan.
- Plans: **Constitution Check** gates; `/speckit.analyze` treats violations as CRITICAL; CI or local gates run **Vitest** and **Playwright** per plan.

### CI pipeline: constitution vs `.github/workflows`

**User decision**: E2E in CI run against `**vite preview`** (after `vite build`), not `vite dev`.

**What belongs in the constitution (English text, 1 short paragraph or bullets):**

- **Yes — policy-level only**: When automated CI exists (e.g. GitHub Actions), it **MUST** run **Vitest before Playwright**, run a **production build** first, serve the app with `**vite preview`** (or equivalent), then run **Playwright** against that URL. Rationale: stable, close-to-ship behavior; avoids flakiness of dev HMR.
- **No — not in the constitution**: Exact YAML, runner OS matrix, Node version, Playwright browser cache keys, job names, or `paths` filters—those live in `**.github/workflows/*.yml`** and optionally **README** / feature **plan.md** under Technical Context.

This keeps the constitution **stable** while allowing workflow tweaks without a constitution amendment.

## Governance

Constitution overrides ad-hoc practice; amendments use semver (MAJOR/MINOR/PATCH per Speckit rules); PRs verify compliance; optional pointer to `README.md` when added.

## Sync Impact Report (prepend to constitution as HTML comment)

- Version: none → **1.0.0** (initial ratification).
- Principles: placeholders → five principles above (tooling folded into P1; P4 extended for PWA/offline/install).
- Sections: product/data/browser/a11y; spec/design/quality including Stitch.
- Templates: plan (gates incl. API, PWA, browsers, Stitch), tasks (mandatory tests), spec (English UI + E2E trace), optional checklist (PWA/offline).

## Template and command propagation

1. **[.specify/templates/plan-template.md](.specify/templates/plan-template.md)** — Replace `## Constitution Check` placeholder with gates matching: Vue/Vite/Vitest/Pinia/Tailwind/TS; Canvas gameplay; performance; responsive + PWA offline + install + client persistence; TDD + Playwright; **one-time asset ingest from CSGO-API**, local static assets, no runtime dependency on API/CDN for tiles; English UI; browser matrix; pointer-first a11y; Stitch for design when applicable; recruitment context if relevant to scope; **CI: Vitest → `vite build` → `vite preview` → Playwright** when CI is in scope.
2. **[.specify/templates/tasks-template.md](.specify/templates/tasks-template.md)** — Mandatory tests; examples use **Vitest** (`*.spec.ts`) and **Playwright** paths; TDD order stated.
3. **[.specify/templates/spec-template.md](.specify/templates/spec-template.md)** — Playwright traceability per story; note that user-visible text is **English**; optional line that design may reference **Stitch** outputs.
4. **[.cursor/commands/](.cursor/commands/)** — Skim `speckit.*.md` for mismatches; no `.specify/templates/commands/` in this repo.
5. **[.specify/templates/checklist-template.md](.specify/templates/checklist-template.md)** — Optional minimal reminders: PWA/offline, cache bust, E2E, performance.

## Validation before write

- No unexplained bracket placeholders; dates **YYYY-MM-DD**; MUST/SHOULD used deliberately.
- Call out in sync report: **CSGO-API** is unofficial; assets are **vendored after one-time download**; **trademark** posture: attribution and non-commercial recruitment context in README/spec—not a guarantee of clearance.

## Deliverable summary (after execution)

- Constitution **v1.0.0**; commit message example: `docs: ratify Speckit constitution v1.0.0 (Vue3, Canvas, PWA, CSGO-API, TDD/Playwright)`.

