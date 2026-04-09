# Research: Game sound effects (011)

## 1. Decision: Web Audio API primary, HTMLAudioElement fallback

**Decision:** Use **`AudioContext` + `AudioBufferSourceNode`** (or buffer playback via `decodeAudioData`) for **primary** playback. Use **`<audio>` elements** (small pool per cue or per play) when Web Audio is **unsupported** or **decode/play throws**.

**Rationale:**

- Lower latency and reliable **overlapping one-shots** (multiple flips in quick succession) vs resetting a single `<audio>` tag.
- Matches **FR-008** and product clarification (modern API + fallback).

**Alternatives considered:**

- **`<audio>` only** — simpler but worse overlap and timing on some browsers.
- **Third-party library** (e.g. Howler) — rejected for v1 to avoid dependency and bundle cost for six short clips.

## 2. Decision: One-time decode / buffer cache

**Decision:** Fetch (or array buffer from `fetch`) each file **once**, `decodeAudioData` into an `AudioBuffer` map keyed by cue. Reuse for every play.

**Rationale:** Avoid repeated decode on hot paths; keeps **pick** and **rAF** handlers light.

**Alternatives considered:** Decode on first play only (lazy) — acceptable if init time must be minimized; still **once per cue**.

## 3. Decision: Main-thread budget

**Decision:** **No** `await decodeAudioData` inside `onCanvasPick` / rAF. Initialization: eager after first user interaction or idle `requestIdleCallback` if available; otherwise start decode on app mount with **try/catch** and degrade to `<audio>`.

**Rationale:** Constitution **performance** principle; canvas frame budget already tight.

**Measurable expectation:** Starting a one-shot after buffers exist SHOULD be **O(1)** from the caller’s perspective (`start()` + schedule stop if needed).

## 4. Decision: AudioContext resume (autoplay)

**Decision:** Call **`audioContext.resume()`** from the **first** **`pointerdown`** / **`click`** on the document or from the first **canvas pick** / **button** handler (idempotent).

**Rationale:** Chromium / Safari require user gesture for audible output; silent `resume()` failure is OK.

## 5. Decision: Fail cue timing

**Decision:** Fire **fail** when **`clearMismatch`** runs in **`gamePlay`** after **`MISMATCH_RESOLVE_MS`** (same moment engine returns tiles to concealed), not when the second tile is first revealed.

**Rationale:** Matches spec **User Story 1** acceptance **2** (“when the mismatch is **resolved**”) and avoids playing fail during shake-only phase.

## 6. Decision: Win cue randomness

**Decision:** `Math.random() < 0.5` (or integer on `crypto.getRandomValues` if avoiding test flakiness — optional) to choose between the two MP3s **once per `won: true` event**.

**Rationale:** Satisfies **FR-004** / **SC-003**; deterministic tests can mock RNG.

## 7. Decision: UI click coverage

**Decision:** Centralize **`playClick()`** in the audio module; invoke from **`AppButton`**, **`MemoSecondaryNavButton`**, and any remaining **primary** `<button>` / link activations after an **audit** (dialogs, debrief, briefcase, dev-only canvas button).

**Rationale:** Spec **FR-005** requires **base-level** coverage; not every screen should reimplement.

## 8. Browser matrix (constitution)

**Targets:** Latest **Chrome / Edge (Chromium)**, **Firefox**, **Safari** on current stable OS versions; extended-support channels as available in CI runners.

**Note:** Web Audio is widely available; fallback path validates **older WebKit** / restricted environments where `AudioContext` is missing or decode fails.

## 9. PWA / offline

**Decision:** Keep files under **`public/audio/`** so they are included in the **Vite PWA** precache / static deploy alongside existing `public/tiles` patterns.

**Rationale:** No runtime network for SFX; aligns with offline core loop.
