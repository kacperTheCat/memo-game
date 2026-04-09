# Data model: Game sound effects (011)

This feature introduces **no persisted entities**. Below is the **logical model** for code and tests.

## Sound cue

| Field | Description |
|-------|-------------|
| `id` | One of: `click`, `flip`, `success`, `fail`, `winT`, `winCT` |
| `publicPath` | Path relative to app origin, e.g. `audio/flip.mp3` (with `BASE_URL` prefix at runtime) |

`winT` / `winCT` map to **terrorist-wins** and **counter-terrorists-win** files respectively; **`winRandom`** is a **runtime choice** between them (not a third file).

## Audio module (in-memory)

| State | Description |
|-------|-------------|
| `mode` | `'webAudio' \| 'htmlAudio' \| 'unavailable'` — last-known working strategy |
| `context` | `AudioContext \| null` — created lazily; may be `suspended` until gesture |
| `buffers` | Map `cueId → AudioBuffer` when `mode === 'webAudio'` |
| `fallbackPool` | Optional map `cueId → HTMLAudioElement[]` for overlap, or equivalent |

**Transitions:**

- Init / first play: attempt Web Audio decode → on success set `webAudio`; on failure set `htmlAudio`.
- Any play error: catch, optionally downgrade once; never throw to UI layer.

## Game event → cue (reference)

| Game / UI event | Cue(s) |
|-----------------|--------|
| Tile concealed → revealed (accepted pick) | `flip` |
| Mismatch pair cleared (`clearMismatch`) | `fail` |
| Pair matched (engine) | `success` |
| `tryPick` returns `won: true` | one of `winT`, `winCT` (random) |
| Primary button / nav / styled **RouterLink** CTA (e.g. home Configure) | `click` |
| Briefcase difficulty radio **`change`** | `click` |

## Relationships

- **Pinia `gamePlay`**: owns mismatch timer; **calls** audio module for `fail` only (or emits internal hook — avoid circular imports; prefer **`import { playFail } from '@/audio/...'`** from store).
- **`GameCanvasShell`**: calls `flip`, `success`, `win*` based on `tryPick` outcome.
- **UI components** (`HomeView`, `BriefcaseView`, primitives): call `click` via **`playUiClick()`** where spec applies.

No changes to **`MemoryState`**, **`localStorage`** snapshot shapes, or session records.
