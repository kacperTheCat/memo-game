# Research: 003 CSGO tile libraries & Game grid display

**Branch**: `003-csgo-tile-libraries` | **Date**: 2026-04-07

## 1. Browser and runtime matrix

**Decision:** Target **latest stable** Chrome, Firefox, and Safari; CI uses **Chromium** only (existing workflow). Local dev uses Vite dev server; E2E uses **`vite build` + `vite preview`** on `127.0.0.1:4173` per `playwright.config.ts`.

**Rationale:** Matches `.specify/memory/constitution.md` and existing `ci.yml` / Playwright setup.

**Alternatives considered:** Expanding CI to WebKit/Firefox (deferred—cost vs. recruitment scope).

---

## 2. Shared difficulty state (Briefcase → Game)

**Decision:** **Pinia** store `useGameSettingsStore` with `difficulty: 'easy' | 'medium' | 'hard'` (default **`medium`** per spec edge case for direct `/game` navigation). **Briefcase** radios **write** the store; **Game** **reads** the store. Optional **`sessionStorage`** sync via Pinia plugin or `watch` for refresh resilience—**deferred** unless plan tasks call for it.

**Rationale:** Constitution requires Vue 3 + Pinia; spec FR-008 requires shared configuration; Briefcase today uses local `ref` only.

**Alternatives considered:** `vue-router` query params (extra UX noise); only `provide/inject` (breaks route boundaries).

---

## 3. Canvas vs DOM for the image grid

**Decision:** Render the **tile grid on the existing HTML `<canvas>`** inside `GameCanvasShell` using **`drawImage`** in a **single paint path** (layout computed from canvas CSS size × `devicePixelRatio`). **No** DOM grid of `<img>` cards as the primary board.

**Rationale:** Satisfies constitution **Canvas-first gameplay** for the game surface; display-only is still the “game board” locus; hit-testing can remain a no-op until a later feature.

**Alternatives considered:** DOM/CSS grid for static images—**rejected** as primary surface under constitution II.

---

## 4. Asset ingest (ByMykel CSGO-API)

**Decision:** **Node 22** script under `scripts/` (e.g. `scripts/fetch-tile-library.mjs`) using **`fetch`** to read `https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json` (or checked-in snapshot), select **32** skins by **stable criteria** (e.g. first 32 with non-null `image` and `rarity`), download images into **`public/tiles/`** with deterministic filenames (`{id}.png` or original extension), emit **`src/data/tile-library.json`** with `{ id, rarity, color, imagePath }` where `imagePath` is a **public URL path** (`/tiles/...`). Add **`ATTRIBUTION.md`** (or section in `README`) citing [ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API) (MIT).

**Rationale:** Constitution product boundaries; spec Assumptions; offline/PWA-friendly runtime.

**Alternatives considered:** Runtime fetch from raw GitHub in the browser—**rejected** (network dependency, CORS). Subsetting from `all.json`—optional optimization.

---

## 5. Deterministic cell filling

**Decision:** For **unique count** `n` (Easy **8**, Medium **18**, Hard **32**), take the **first `n` entries** in `tile-library.json` order. **Cell list** = **two copies** concatenated: `[...entries, ...entries]` (length `2n`), assigned **row-major** (left→right, top→bottom). **Hard** uses full 32 → 64 cells; **Easy** 8 → 16; **Medium** 18 → 36.

**Rationale:** Matches spec Assumptions and FR-001/FR-009.

**Alternatives considered:** Interleaving pairs `(0,0,1,1,...)`—acceptable variant; document one algorithm in `data-model.md` only.

---

## 6. Library validation (FR-005 / P3)

**Decision:** **Vitest** tests importing `src/game/library/validateTileLibrary.ts` (pure functions) asserting **exactly 32** entries, required fields, **file exists** under `public/` (using `fs` in test or path check relative to repo root). Run in **`pnpm test`**. Optional **JSON Schema** in `specs/003-csgo-tile-libraries/contracts/tile-library.schema.json` duplicated or referenced from `src/` for documentation.

**Rationale:** P3 acceptance; TDD; no Playwright required for schema.

**Alternatives considered:** Only manual review—**rejected**.

---

## 7. E2E strategy for canvas

**Decision:** Expose **non-visual test hooks** on the game shell: e.g. `data-testid="game-grid-meta"` with **`data-rows`**, **`data-cols`**, and optionally **`data-cells`** (expected cell count). Assert **Briefcase → Play →** meta matches **4/6/8**. For “images loaded”, combine **meta** with **canvas** `toHaveScreenshot` optional) or check **no** thrown errors and **canvas** width/height **> 0**—minimum bar: **grid dimensions** + **no console errors**; strengthen with **pixel** sample via `page.evaluate` on `getImageData` if flaky.

**Rationale:** Canvas is hard to assert visually; spec SC-001 needs strong signal—dimension + successful draw path is phase-1 E2E minimum.

**Alternatives considered:** Screenshot-only—flaky on CI without threshold.

---

## 8. Performance budget (display-only)

**Decision:** **Initial** grid paint after navigation: decode **at most `n` unique** images (≤32); use **`Promise.all`** on `HTMLImageElement.decode()` or `onload`; **single** redraw after all ready. Target **< 500 ms** on desktop CI from **navigation to first successful draw** (informational—not a hard gate unless tasks add perf test).

**Rationale:** Constitution III; avoids sequential decode stalls.

**Alternatives considered:** No budget—**rejected** for plan traceability.
