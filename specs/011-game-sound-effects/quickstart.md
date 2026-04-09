# Quickstart: Game sound effects (011)

## Manual smoke

1. `pnpm dev` — open `/game` with **device audio on**.
2. **Flip** a tile → hear **flip**.
3. **Mismatch** two tiles → after shake / flip-back, hear **fail**.
4. **Match** a pair → hear **success**.
5. **Clear the board** → hear **one** random **win** sting.
6. From **home**, **Configure New Game** → **click**; on **briefcase**, change **difficulty** → **click** per change; use other nav (**Abandon**, **Confirm**, etc.) → **click** on each activation.
7. **Mute system** or **deny audio** (if testable) → repeat steps; UI MUST stay usable, **no** errors.

## Automated

```bash
pnpm test
pnpm run lint
pnpm run test:e2e:preview   # or test:e2e per CI parity
```

## Playwright file

- **`e2e/game-sound-effects.spec.ts`** — seeded win, mismatch resolve, abandon dialog, briefcase unlock; asserts **no page console errors** after interactions.
- Vitest-only: `window.__MEMO_SFX` cue log when `import.meta.env.MODE === 'test'` (not in production E2E builds).

## Assets

Confirm files exist:

`public/audio/click.mp3`, `flip.mp3`, `success.mp3`, `fail.mp3`, `terrorist-wins.mp3`, `counter-terrorists-win.mp3`.
