import type { PairResolutionState, TileRuntimeState } from '@/game/memoryTypes'

export interface MemoryState {
  cells: TileRuntimeState[]
  pair: PairResolutionState
}

export function createInitialState(identityPerCell: number[]): MemoryState {
  return {
    cells: identityPerCell.map((identityIndex) => ({
      identityIndex,
      phase: 'concealed' as const,
    })),
    pair: { firstIndex: null, secondIndex: null, locked: false },
  }
}

/** Two revealed tiles selected as a pair, not a match — mismatch feedback may still be running. */
export function isWrongPairPending(state: MemoryState): boolean {
  const { firstIndex, secondIndex } = state.pair
  if (firstIndex === null || secondIndex === null) {
    return false
  }
  const a = state.cells[firstIndex]
  const b = state.cells[secondIndex]
  return (
    !!a &&
    !!b &&
    a.phase === 'revealed' &&
    b.phase === 'revealed' &&
    a.identityIndex !== b.identityIndex
  )
}

/** Legacy snapshots used `locked: true` during mismatch; normalize so input rules stay consistent. */
export function normalizePairForHydration(state: MemoryState): MemoryState {
  if (!isWrongPairPending(state) || !state.pair.locked) {
    return state
  }
  return {
    cells: state.cells,
    pair: { ...state.pair, locked: false },
  }
}

export function pickCell(
  state: MemoryState,
  index: number,
): { state: MemoryState; accepted: boolean } {
  if (index < 0 || index >= state.cells.length) {
    return { state, accepted: false }
  }

  const target = state.cells[index]
  if (!target) {
    return { state, accepted: false }
  }

  if (target.phase === 'matched') {
    return { state, accepted: false }
  }

  if (isWrongPairPending(state)) {
    if (index === state.pair.firstIndex || index === state.pair.secondIndex) {
      return { state, accepted: false }
    }
    if (target.phase !== 'concealed') {
      return { state, accepted: false }
    }
    const cleared = clearMismatch(state)
    return pickCell(cleared, index)
  }

  if (state.pair.locked) {
    return { state, accepted: false }
  }

  if (target.phase === 'revealed') {
    return { state, accepted: false }
  }

  const cells = state.cells.map((c, i) =>
    i === index ? { ...c, phase: 'revealed' as const } : c,
  )

  if (state.pair.firstIndex === null) {
    return {
      state: {
        cells,
        pair: {
          firstIndex: index,
          secondIndex: null,
          locked: false,
        },
      },
      accepted: true,
    }
  }

  if (state.pair.secondIndex !== null) {
    return { state, accepted: false }
  }

  const firstIdx = state.pair.firstIndex
  if (firstIdx === index) {
    return { state, accepted: false }
  }

  const first = cells[firstIdx]
  const second = cells[index]
  if (!first || !second) {
    return { state, accepted: false }
  }

  if (first.identityIndex === second.identityIndex) {
    const matched = cells.map((c, i) =>
      i === firstIdx || i === index ? { ...c, phase: 'matched' as const } : c,
    )
    return {
      state: {
        cells: matched,
        pair: { firstIndex: null, secondIndex: null, locked: false },
      },
      accepted: true,
    }
  }

  return {
    state: {
      cells,
      pair: {
        firstIndex: firstIdx,
        secondIndex: index,
        locked: false,
      },
    },
    accepted: true,
  }
}

export function clearMismatch(state: MemoryState): MemoryState {
  const { firstIndex, secondIndex } = state.pair
  if (firstIndex === null || secondIndex === null) {
    return state
  }
  const cells = state.cells.map((c, i) =>
    i === firstIndex || i === secondIndex ? { ...c, phase: 'concealed' as const } : c,
  )
  return {
    cells,
    pair: { firstIndex: null, secondIndex: null, locked: false },
  }
}

export function isWin(state: MemoryState): boolean {
  return state.cells.every((c) => c.phase === 'matched')
}

export function shuffleIdentities<T>(items: T[], rng: () => number = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const t = a[i]
    a[i] = a[j]!
    a[j] = t!
  }
  return a
}
