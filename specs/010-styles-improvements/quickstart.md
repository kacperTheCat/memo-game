# Quickstart: 010 Styles improvements

## Develop

```bash
cd "/Users/kacperthecat/memo game/memo-game"
pnpm install
pnpm dev
```

Manual checks:

1. **`/`** — Move mouse: spotlight **lags**; **stop moving ~1 s**: glow **fades out**; move again: returns. Grain **drifts**; foreground stays **above** glow. Optional: narrow the browser and open a view with a **wide horizontal table** (e.g. long session history): confirm the glow still tracks the cursor in the **viewport**, not “off to the side” of the pointer.
2. **`/briefcase`** — Same + yellow blobs **wander** and **change shape**; glass panel on top.
3. **Win debrief** — Win a game → debrief: spotlight + **Operation Complete** letters stagger **≤2s** (letters **remain visible** throughout).
4. **`/game`** — Reveal tiles; move pointer: **revealed** faces show **lighter region** biased toward cursor, **smooth** motion.
5. **Touch device (or devtools mobile emulation)** — Finger **down**: spotlight **on**; **lift**: spotlight **off** (no stuck glow).

## Tests

```bash
pnpm test
pnpm test:e2e:preview   # or full test:e2e per CI
```

New E2E files (per spec):

- `e2e/styles-spotlight-depth.spec.ts`
- `e2e/styles-game-card-gradient.spec.ts`
- `e2e/styles-briefcase-ambience.spec.ts`
- `e2e/styles-operation-complete-text.spec.ts`
- `e2e/styles-grain-motion.spec.ts`

## Reduced motion

macOS: **System Settings → Accessibility → Display → Reduce motion**  
Verify: static or minimal spotlight chase, grain motion off, letter stagger minimal.

## Performance spot-check

Chrome Performance: 5s interaction on Briefcase + Game; watch for long tasks; aim **60 fps** on animations.
