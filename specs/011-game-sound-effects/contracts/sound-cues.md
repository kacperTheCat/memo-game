# Contract: Sound cues (011)

## Public surface (TypeScript)

Implementations SHOULD expose a small **side-effecting** API (exact names flexible):

```ts
export type SfxCue =
  | 'click'
  | 'flip'
  | 'success'
  | 'fail'
  | 'winRandom'

export function playSfx(cue: SfxCue): void
// Optional finer control if tests need it:
export function __resetSfxForTests?(): void
```

- **`playSfx`** MUST **never throw** to callers; log-only or no-op on failure.
- **`winRandom`** MUST choose **one** of the two win MP3s per invocation using uniform randomness (unless test override).

## URL contract

- Resolved URL = **`normalizeBase(import.meta.env.BASE_URL)` + `audio/<file>.mp3`**
- Files: `click.mp3`, `flip.mp3`, `success.mp3`, `fail.mp3`, `terrorist-wins.mp3`, `counter-terrorists-win.mp3`

## Call-site contract

| Caller | Condition | Cue |
|--------|-----------|-----|
| `GameCanvasShell` | `tryPick` accepted && picked index just revealed | `flip` |
| `GameCanvasShell` | `tryPick` accepted && new state is matched pair for this pick | `success` |
| `GameCanvasShell` | `tryPick` returns `won` | `winRandom` **exactly once** |
| `gamePlay` store | After `clearMismatch` applied inside mismatch timeout | `fail` |
| `AppButton`, `MemoSecondaryNavButton`, audited buttons | User activation (click) | `click` |
| `HomeView` | **Configure New Game** `RouterLink` click | `click` |
| `BriefcaseView` | Difficulty radio **`change`** (new selection) | `click` |
| `BriefcaseView` | **Unlock showcase** button | `click` |

## Win single-play guarantee

When **`won: true`**, **`winRandom`** MUST run **once** per round completion event (the same **`tryPick`** call path that sets `won`). **Do not** also play win from `GameView` session watchers unless that path is deduplicated — prefer **shell-only** win SFX next to `emit('won')`.

## E2E observability (optional)

If Playwright cannot assert audio, implementations MAY expose **`window.__MEMO_SFX`** (array of cue ids) **only** when `import.meta.env.MODE === 'test'` or similar **explicit** gate. Production builds MUST NOT leak debug noise.
