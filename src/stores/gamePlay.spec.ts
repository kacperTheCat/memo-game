import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BuiltGrid } from '@/game/buildGridLayout'
import type { TileEntry } from '@/game/tileLibraryTypes'
import { useGamePlayStore } from '@/stores/gamePlay'

describe('gamePlay store', () => {
  const fakeEntry = {
    id: 't',
    rarity: 'c',
    color: '#000',
    imagePath: '/tiles/x.png',
  } satisfies TileEntry

  const grid2x2: BuiltGrid = {
    rows: 2,
    cols: 2,
    n: 2,
    totalCells: 4,
    cells: [
      { row: 0, col: 0, identityIndex: 0, entry: fakeEntry },
      { row: 0, col: 1, identityIndex: 1, entry: fakeEntry },
      { row: 1, col: 0, identityIndex: 0, entry: fakeEntry },
      { row: 1, col: 1, identityIndex: 1, entry: fakeEntry },
    ],
  }

  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('still flips mismatch back after extra taps while locked (timer not cleared)', () => {
    const play = useGamePlayStore()
    play.startNewRound(grid2x2, () => 0)

    expect(play.tryPick(0).accepted).toBe(true)
    expect(play.tryPick(1).accepted).toBe(true)
    expect(play.memory?.pair.locked).toBe(true)

    expect(play.tryPick(2).accepted).toBe(false)

    vi.advanceTimersByTime(900)

    const m = play.memory
    expect(m?.pair.locked).toBe(false)
    expect(m?.cells[0]?.phase).toBe('concealed')
    expect(m?.cells[1]?.phase).toBe('concealed')
  })
})
