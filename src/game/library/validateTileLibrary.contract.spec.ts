import { describe, expect, it } from 'vitest'
import committed from '@/data/tile-library.json'
import { validateTileLibraryData } from '@/game/library/validateTileLibrary'

describe('validateTileLibrary contract (US3)', () => {
  it('accepts committed library JSON', () => {
    expect(validateTileLibraryData(committed)).toBeNull()
  })

  it('rejects a cloned library with wrong entry count', () => {
    const bad = {
      entries: (committed as { entries: unknown[] }).entries.slice(0, 5),
    }
    expect(validateTileLibraryData(bad)).toMatch(/exactly 32/)
  })

  it('rejects duplicate imagePath in a synthetic library', () => {
    const entries = Array.from({ length: 32 }, (_, i) => ({
      id: `id-${i}`,
      rarity: 'R',
      color: '#fff',
      imagePath: '/tiles/dup.png',
    }))
    expect(validateTileLibraryData({ entries })).toMatch(/duplicate imagePath/)
  })
})
