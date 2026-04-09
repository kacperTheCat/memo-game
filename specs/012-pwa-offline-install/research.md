# Research: PWA offline persistence and install prompt (012)

## 1. Service worker precache scope (`vite-plugin-pwa` / Workbox)

**Decision:** Extend **`workbox.globPatterns`** in `vite.config.ts` to include **`mp3`** (and keep existing **`png`**) so **`public/audio/*.mp3`** and **`public/tiles/*.png`** are part of the production precache manifest.

**Rationale:** Current glob is `**/*.{js,css,html,ico,png,svg,woff2}` — **audio is omitted**, so offline play after first load can fail SFX requests. Tile PNGs already match `png`; verifying them remain in the build output is sufficient.

**Alternatives considered:** Runtime-only caching for `/audio/*` — works but duplicates strategy; precache keeps gameplay deterministic and matches “first successful load” wording.

## 2. Third-party fonts vs offline shell

**Decision:** Add **Workbox `runtimeCaching`** rules (e.g. **StaleWhileRevalidate** or **CacheFirst** with sensible `maxEntries` / expiration) for **`https://fonts.googleapis.com/**`** and **`https://fonts.gstatic.com/**`** so a first online visit populates the cache and subsequent offline sessions still resolve font CSS and font files.

**Rationale:** `index.html` references **Google Fonts** (Material Symbols). Without caching, offline mode falls back to system fonts only; acceptable for gameplay but weakens “full offline” polish. Self-hosting font files under `public/` is a stronger guarantee but increases repo weight; defer unless product requires zero third-party requests offline.

**Alternatives considered:** Self-host Material Symbols subset under `public/fonts/` — best for air-gapped/offline demos; higher implementation cost.

## 3. Persisting briefcase / player settings

**Decision:** Introduce a **versioned `localStorage` JSON** document keyed separately from session snapshots (new key, e.g. **`memo-game.v1.playerSettings`**, with `schemaVersion: 1`) holding at least **`difficulty`** and **`briefcaseSeedRaw`** (the briefcase seed field text). **Do not** persist **`dealSeed`** (one-shot, consumed on deal).

**Rationale:** `useGameSettingsStore` is currently in-memory only; reload loses difficulty and seed field. Spec **FR-002** requires these to survive reload. Keeping **`dealSeed`** out avoids surprising “stale forced seed” after a completed round.

**Alternatives considered:** Pinia persist plugin — adds dependency; plain `localStorage` + small module matches **004** style and **FR-008** (no session snapshot schema bump).

## 4. Install invitation UX and APIs

**Decision:** Implement an **in-repo Vue** bottom sheet (Tailwind + existing button/dialog patterns), **not** a third-party package. Listen for **`beforeinstallprompt`** on **`window`**, **`preventDefault()`** to suppress the browser mini-infobar, store the event for **`prompt()`** when the user taps **Install**. Listen for **`appinstalled`** to record completion. Use **`matchMedia('(display-mode: standalone)')`** (and **`navigator.standalone`** on iOS where applicable) to **hide** the sheet when already installed.

**Rationale:** Matches spec **FR-006** (application-owned styling) and avoids npm coupling; [khmyznikov/pwa-install](https://khmyznikov.com/pwa-install/) is a **behavioral** reference only.

**Alternatives considered:** Wrap `@khmyznikov/pwa-install` — faster but harder to match memo-game chrome; rejected for styling/ownership reasons unless implementation time forces it.

## 5. iOS / Safari install behavior

**Decision:** **No synthetic install prompt** on browsers without **`beforeinstallprompt`**. The invitation **does not appear** (or remains hidden) when the API never fires; **no error loops**. Optional future enhancement: a **non-modal** “Tip: Add to Home Screen” using **English** copy only when product explicitly scopes it (out of scope for v1 unless tasks expand).

**Rationale:** Spec edge cases: unsupported install → sheet hidden. iOS uses Share → Add to Home Screen without a programmable install prompt.

## 6. Install prompt “once until outcome” persistence

**Decision:** Versioned **`localStorage`** record (new key, e.g. **`memo-game.v1.pwaInstallUi`**) with `schemaVersion: 1` and **`outcome`**: **`pending` | `seen` | `dismissed` | `installed`**. On **first** sheet display, set **`seen`** so a reload does not show the panel again (spec “once” behavior). Set **`dismissed`** on **Not now**; **`installed`** on **`appinstalled`** or standalone detection.

**Rationale:** Spec **FR-005** requires remembering dismiss vs install across visits. Clearing site data resets all keys together (spec edge case).

**Alternatives considered:** `sessionStorage` — would re-prompt every tab; rejected.

## 7. E2E constraints (Playwright)

**Decision:** **`e2e/pwa-persistence-offline.spec.ts`**: assert **settings persistence** and **in-progress restore** via UI + optional `localStorage` reads; use **`context.setOffline(true)`** after **`waitUntil: 'networkidle'`** or after **`navigator.serviceWorker.ready`** (whichever stabilizes SW activation against **127.0.0.1:4173**).

**Decision:** **`e2e/pwa-install-prompt.spec.ts`**: primary path **Chromium** (`beforeinstallprompt` can be **dispatched in page** via **`page.evaluate`** for deterministic tests); assert **dismiss** persists non-display across reload. Mark **Safari/Firefox**-specific install flows **optional** in test plan if APIs differ.

**Rationale:** Constitution requires Playwright per story; install API is engine-specific.

## 8. Browser matrix (testing)

**Decision:** Align with constitution: **latest** Chrome / Edge (Chromium), **Firefox**, **Safari** on supported OS; **P1** automated E2E on **Desktop Chrome** (existing `playwright.config.ts`). Manual smoke for **offline** + **install** on **mobile Chrome** recommended before release.

**Rationale:** Install prompt and SW nuances differ; plan documents without duplicating constitution version pins.

## 9. Performance / canvas interaction

**Decision:** Install sheet is a **fixed bottom DOM layer**; must not intercept **canvas** pointer events when hidden. When visible, **dismiss** and **Install** targets MUST meet **44px** touch-friendly minimum where the design system allows.

**Rationale:** Constitution **canvas-first** and pointer-first; sheet is chrome only.
