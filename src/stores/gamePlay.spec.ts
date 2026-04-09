import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BuiltGrid } from '@/game/buildGridLayout'
import type { TileEntry } from '@/game/tileLibraryTypes'
import type { MemoryState } from '@/game/memoryEngine'
import { isWrongPairPending } from '@/game/memoryEngine'
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

  it('wrong pair then interrupt: third pick clears mismatch and timer does not double-clear', () => {
    const play = useGamePlayStore()
    play.startNewRound(grid2x2, () => 0)

    expect(play.tryPick(0).accepted).toBe(true)
    expect(play.tryPick(1).accepted).toBe(true)
    expect(play.memory && isWrongPairPending(play.memory)).toBe(true)
    expect(play.memory?.pair.locked).toBe(false)

    expect(play.tryPick(2).accepted).toBe(true)
    expect(play.memory?.cells[0]?.phase).toBe('concealed')
    expect(play.memory?.cells[1]?.phase).toBe('concealed')
    expect(play.memory?.cells[2]?.phase).toBe('revealed')

    vi.advanceTimersByTime(900)

    const m = play.memory
    expect(m?.cells[0]?.phase).toBe('concealed')
    expect(m?.cells[1]?.phase).toBe('concealed')
    expect(m?.cells[2]?.phase).toBe('revealed')
  })

  it('wrong pair without interrupt: timer clears tiles', () => {
    const play = useGamePlayStore()
    play.startNewRound(grid2x2, () => 0)
    expect(play.tryPick(0).accepted).toBe(true)
    expect(play.tryPick(1).accepted).toBe(true)
    expect(play.tryPick(0).accepted).toBe(false)

    vi.advanceTimersByTime(900)

    const m = play.memory
    expect(m?.cells[0]?.phase).toBe('concealed')
    expect(m?.cells[1]?.phase).toBe('concealed')
    expect(m?.pair.firstIndex).toBeNull()
  })

  it('hydrateFromSnapshot normalizes legacy locked and arms mismatch timer', () => {
    const play = useGamePlayStore()
    const identities = [0, 1, 0, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7]
    const cells: MemoryState['cells'] = identities.map((identityIndex, i) => ({
      identityIndex,
      phase: i === 0 || i === 1 ? ('revealed' as const) : ('concealed' as const),
    }))
    const pair = {
      firstIndex: 0,
      secondIndex: 1,
      locked: true as boolean,
    }
    play.hydrateFromSnapshot(cells, pair, 'easy')
    expect(play.memory?.pair.locked).toBe(false)
    expect(play.memory && isWrongPairPending(play.memory)).toBe(true)

    vi.advanceTimersByTime(900)
    expect(play.memory?.cells[0]?.phase).toBe('concealed')
    expect(play.memory?.cells[1]?.phase).toBe('concealed')
  })
})
