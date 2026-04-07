/**
 * Grid layout for the Game canvas.
 * Fill rules: `specs/003-csgo-tile-libraries/data-model.md`.
 */
import type { Difficulty, TileEntry } from '@/game/tileLibraryTypes'

export interface GridDimensions {
  rows: number
  cols: number
  /** Number of distinct identities used for this difficulty (subset of the 32-entry library). */
  n: number
}

export function gridDimensions(difficulty: Difficulty): GridDimensions {
  switch (difficulty) {
    case 'easy':
      return { rows: 4, cols: 4, n: 8 }
    case 'medium':
      return { rows: 6, cols: 6, n: 18 }
    case 'hard':
      return { rows: 8, cols: 8, n: 32 }
  }
}

export interface GridCell {
  row: number
  col: number
  identityIndex: number
  entry: TileEntry
}

export interface BuiltGrid {
  rows: number
  cols: number
  n: number
  totalCells: number
  cells: GridCell[]
}

/**
 * Row-major layout. Each of the first `n` library entries appears exactly twice (two cycles: indices k % n).
 */
export function buildGridCells(
  entries: readonly TileEntry[],
  difficulty: Difficulty,
): BuiltGrid {
  const { rows, cols, n } = gridDimensions(difficulty)
  if (entries.length < n) {
    throw new Error(
      `tile library has ${entries.length} entries; need at least ${n} for difficulty "${difficulty}"`,
    )
  }
  const subset = entries.slice(0, n)
  const totalCells = rows * cols
  if (totalCells !== n * 2) {
    throw new Error(`internal: expected ${n * 2} cells, got ${totalCells}`)
  }
  const cells: GridCell[] = []
  for (let k = 0; k < totalCells; k++) {
    const identityIndex = k % n
    const row = Math.floor(k / cols)
    const col = k % cols
    const entry = subset[identityIndex]
    if (!entry) {
      throw new Error(`missing entry at identityIndex ${identityIndex}`)
    }
    cells.push({ row, col, identityIndex, entry })
  }
  return { rows, cols, n, totalCells, cells }
}
