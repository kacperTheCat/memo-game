# Implementation Plan: Game sound effects (011)

**Branch**: `011-game-sound-effects` | **Date**: 2026-04-09 (updated for FR-005 / FR-005a hub + briefcase) | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/011-game-sound-effects/spec.md`

## Summary

Add **short bundled SFX** for **UI clicks** (including **non-`AppButton` primary CTAs** and **briefcase difficulty radios** per **FR-005** / **FR-005a**), **tile reveal**, **pair mismatch resolution**, **pair match**, and **round win** (random choice between two win stings). Playback MUST follow **FR-008**: **Web Audio API** when available, **HTML `<audio>`** fallback otherwise; failures or autoplay blocks MUST be silent (no user-visible errors).

**Technical approach:** Small **`src/audio/gameSfx.ts`** owns decoding, **`AudioContext`** lifecycle (resume on first user gesture), cue routing, and fallback. **Canvas** remains primary for the board (constitution); SFX hooks live in **`GameCanvasShell.vue`** (pick / win) and **`gamePlay`** store (mismatch timer → fail). **UI click** uses shared **`playUiClick()`** from **`AppButton`**, **`MemoSecondaryNavButton`**, **styled `RouterLink`** (e.g. home **Configure New Game** in **`HomeView.vue`**), **`@change` on briefcase difficulty radios** (`BriefcaseView.vue`), and audited **`<button>`** / dialog actions — primary CTAs need **not** share one Vue component as long as they call the same helper (**spec clarifications 2026-04-09**).

## Technical Context

**Language/Version**: TypeScript **5.7**, Node **22.x** (root `package.json`)  
**Primary Dependencies**: Vue **3.5**, Vite **6**, Pinia **3**, Vue Router **4**, Tailwind **4** (`@tailwindcss/vite`), `vite-plugin-pwa`  
**Storage**: **N/A** — no new `localStorage` keys (spec FR-007); audio assets under `public/audio/*.mp3`  
**Testing**: Vitest **3** (`src/**/*.spec.ts`), Playwright **~1.49** (`e2e/`)  
**Target Platform**: Modern browsers (Chromium, Firefox, Safari)—[`research.md`](./research.md) §8  
**Project Type**: SPA (Vue) — canvas-first game surface + DOM chrome  
**Performance Goals**: **Decode and buffer once** per cue at init or lazy-first-use; **`play` trigger** work MUST stay **sub-frame** on the main thread (no long sync work in input/rAF handlers beyond starting playback)—[`research.md`](./research.md) §3  
**Constraints**: Canvas-first board (unchanged); English copy; offline core after first load (PWA); bundled `public/audio` only  
**Scale/Scope**: Six short MP3s; overlapping one-shots acceptable per spec edge cases

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Stack**: Vue 3 + TypeScript + Vite + Vitest + Pinia + Tailwind.
- [x] **Canvas**: Playable grid remains on HTML Canvas; audio is orthogonal.
- [x] **Performance**: Decode/init and trigger budgets in `research.md` §3; no heavy work in rAF beyond existing paint.
- [x] **Responsive + PWA + state**: No new persistence; assets cached with app shell.
- [x] **Tests**: Playwright `e2e/game-sound-effects.spec.ts` per spec; Vitest for audio module / routing logic ([`contracts/sound-cues.md`](./contracts/sound-cues.md)).
- [x] **Assets**: Local `public/audio`; tiles unchanged; CSGO-API ingest unaffected.
- [x] **Copy + browsers**: English; matrix in `research.md` §8.
- [x] **Accessibility**: Pointer-first; audio is supplementary (muted / blocked = silent degrade).
- [x] **Repo layout**: Single root `package.json`; `e2e/` + Vitest colocated.
- [x] **Design**: No new Stitch requirement; optional `data-sfx` hooks for E2E only if needed.
- [x] **CI**: Existing Vitest → build → Playwright flow unchanged.
- [x] **Scope**: Non-commercial / portfolio context unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/011-game-sound-effects/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sound-cues.md
└── tasks.md              # /speckit.tasks (not created by /speckit.plan)
```

### Source Code (repository root)

```text
public/audio/
├── click.mp3
├── flip.mp3
├── success.mp3
├── fail.mp3
├── terrorist-wins.mp3
└── counter-terrorists-win.mp3
src/
├── audio/                        # NEW (recommended): cue URLs, Web Audio + fallback
│   └── gameSfx.ts                # or split: context.ts, playCue.ts
├── views/
│   └── HomeView.vue              # Configure New Game RouterLink → playUiClick
├── components/
│   ├── GameCanvasShell.vue       # flip / match / win hooks on tryPick + won
│   ├── briefcase/
│   │   └── BriefcaseView.vue     # Unlock + difficulty @change → playUiClick
│   └── ui/
│       ├── AppButton.vue         # click on button + RouterLink activation
│       └── MemoSecondaryNavButton.vue
├── stores/
│   └── gamePlay.ts               # fail SFX when mismatch timer applies clearMismatch
e2e/
└── game-sound-effects.spec.ts    # flows + optional window.__SFX test hook
```

**Structure Decision**: Single-package Vue SPA; **no** new npm audio dependency unless `research.md` revisits (default: native APIs only).

## Phase 0–1 outputs

| Artifact | Purpose |
|----------|---------|
| [`research.md`](./research.md) | Web Audio vs `<audio>` fallback, decode/init, gesture / autoplay |
| [`data-model.md`](./data-model.md) | Cue enum, asset map, module state |
| [`contracts/sound-cues.md`](./contracts/sound-cues.md) | Callable surface + event→cue mapping |
| [`quickstart.md`](./quickstart.md) | Manual verify + E2E notes |

## Implementation notes

### Cue → asset map (FR-006)

| Cue | File (under `public/audio/`) |
|-----|------------------------------|
| click | `click.mp3` |
| flip | `flip.mp3` |
| success | `success.mp3` |
| fail | `fail.mp3` |
| win (random) | `terrorist-wins.mp3` **or** `counter-terrorists-win.mp3` |

Use Vite `import.meta.env.BASE_URL` when building public URLs (same pattern as `GameCanvasShell` `assetUrl`).

### Event hooks (align with spec acceptance)

1. **Flip (FR-001):** On **accepted** pick in `GameCanvasShell.onCanvasPick` after `tryPick`, if the picked cell is **newly revealed** (concealed → revealed), call `playFlip()` once.
2. **Success (FR-003):** On the same accepted pick, if the engine transitions the two touched cells to **matched** (pair cleared, identities equal), call `playSuccess()` once.
3. **Fail (FR-002):** When **`gamePlay`** mismatch **`setTimeout`** runs and applies **`clearMismatch`** (tiles return to concealed), call `playFail()` once — matches “mismatch **resolved**”.
4. **Win (FR-004):** When `tryPick` returns `won: true`, pick **one** win variant with `Math.random()` and play before/after `finalizeSession` (order MUST NOT cause double play; see [`contracts/sound-cues.md`](./contracts/sound-cues.md)).
5. **UI click (FR-005 / FR-005a):** **`AppButton`**: native `click` on `<button>` and **`RouterLink`**. **`MemoSecondaryNavButton`**: same. **`HomeView`**: home hub **Configure New Game** styled **`RouterLink`** — **`@click` → `playUiClick()`** (not the same component as Unlock; same cue). **`BriefcaseView`**: **Unlock** button (existing) + **difficulty** `<input type="radio">` **`@change` → `playUiClick()`** once per selection change. **Audit** `MemoConfirmDialog`, `WinDebriefPanel`, **`GameCanvasShell`** debug/control — shared **`playUiClick()`**.

### Web Audio + fallback (FR-008)

- Try `AudioContext` + `decodeAudioData` (or fetch + decode once per file).
- If `AudioContext` missing / `decodeAudioData` throws / `start` throws → use **pool of `HTMLAudioElement`** instances per cue (or one element, `src` swap if latency acceptable—prefer small pool for overlap).
- **`audioContext.resume()`** on **first user gesture** (e.g. `pointerdown` on `document` or first button/canvas pick) to satisfy autoplay policies.

### Testing

- **Vitest**: pure functions — win variant selection distribution smoke (mock `Math.random`), URL builder, “fallback chosen when context null” (mocked).
- **Playwright**: complete **easy** round and navigation using **existing `data-testid`s**; assert **no console errors**; optional **`window` test hook** (e.g. `__MEMO_SFX_LOG`) gated by `import.meta.env.MODE === 'test'` or `data-e2e-sfx` attr — **only** if required to stabilize assertions (spec allows behavioral tests). **Briefcase difficulty**: radios are **`sr-only`** inside **`label.memo-radio-card`** — e2e should **click the label** (e.g. `getByTestId('briefcase-difficulty').locator('label.memo-radio-card').filter({ has: page.locator('input[type="radio"][value="hard"]') })`), not the raw `<input>`, or Playwright reports pointer interception.

## Complexity Tracking

None.
