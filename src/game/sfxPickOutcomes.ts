import type { MemoryState } from '@/game/memoryEngine'

/** Shallow copy for comparing before/after an accepted pick. */
export function cloneMemoryStateShallow(m: MemoryState): MemoryState {
  return {
    cells: m.cells.map((c) => ({ ...c })),
    pair: { ...m.pair },
  }
}

/**
 * Derive which one-shot SFX to fire for an accepted pick.
 * `flip`: face-down → face-up (revealed or matched).
 * `success`: this pick completed a matching pair.
 */
export function sfxOutcomesForPick(
  before: MemoryState,
  after: MemoryState,
  pickIndex: number,
): { flip: boolean; success: boolean } {
  const b = before.cells[pickIndex]
  const a = after.cells[pickIndex]
  if (!b || !a) {
    return { flip: false, success: false }
  }

  const flip =
    b.phase === 'concealed' &&
    (a.phase === 'revealed' || a.phase === 'matched')

  const matchedBefore = before.cells.filter((c) => c.phase === 'matched').length
  const matchedAfter = after.cells.filter((c) => c.phase === 'matched').length
  const success =
    matchedAfter > matchedBefore && a.phase === 'matched'

  return { flip, success }
}
