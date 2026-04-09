import { describe, expect, it } from 'vitest'
import { buildGridCells, gridDimensions } from '@/game/canvas/buildGridLayout'
import type { TileEntry } from '@/game/library/tileLibraryTypes'

function makeEntries(count: number): TileEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    rarity: 'r',
    color: '#fff',
    imagePath: `/tiles/${i}.png`,
  }))
}

describe('gridDimensions', () => {
  it('maps difficulty to rows, cols, n', () => {
    expect(gridDimensions('easy')).toEqual({ rows: 4, cols: 4, n: 8 })
    expect(gridDimensions('medium')).toEqual({ rows: 6, cols: 6, n: 18 })
    expect(gridDimensions('hard')).toEqual({ rows: 8, cols: 8, n: 32 })
  })
})

describe('buildGridCells', () => {
  const lib = makeEntries(32)

  it('produces 16 / 36 / 64 cells for easy / medium / hard', () => {
    expect(buildGridCells(lib, 'easy').totalCells).toBe(16)
    expect(buildGridCells(lib, 'medium').totalCells).toBe(36)
    expect(buildGridCells(lib, 'hard').totalCells).toBe(64)
  })

  it('uses two full identity cycles (k % n) for each difficulty', () => {
    for (const d of ['easy', 'medium', 'hard'] as const) {
      const { n, cells, cols } = buildGridCells(lib, d)
      for (let k = 0; k < cells.length; k++) {
        expect(cells[k].identityIndex).toBe(k % n)
        expect(cells[k].row).toBe(Math.floor(k / cols))
        expect(cells[k].col).toBe(k % cols)
      }
    }
  })

  it('maps first and last cell to expected entry ids (easy)', () => {
    const { cells } = buildGridCells(lib, 'easy')
    expect(cells[0].entry.id).toBe('id-0')
    expect(cells[7].entry.id).toBe('id-7')
    expect(cells[8].entry.id).toBe('id-0')
    expect(cells[15].entry.id).toBe('id-7')
  })

  it('throws if library too small for difficulty', () => {
    const small = makeEntries(5)
    expect(() => buildGridCells(small, 'easy')).toThrow(/at least 8/)
  })
})
