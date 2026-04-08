/** Max content width for the board shell (FR-003 desktop reference). */
export const BOARD_MAX_WIDTH_CSS = 1200

/** Gap between adjacent tiles (CSS px). */
export const BOARD_GAP_PX = 6

export interface GridLayoutMetrics {
  cellW: number
  cellH: number
  gap: number
  rows: number
  cols: number
}

/**
 * Compute cell size so `cols` cells and `(cols-1)` gaps fit in `cssWidth`, same for height.
 */
export function computeGridLayout(
  cssWidth: number,
  cssHeight: number,
  rows: number,
  cols: number,
  gap: number = BOARD_GAP_PX,
): GridLayoutMetrics {
  const w = Math.max(1, cssWidth)
  const h = Math.max(1, cssHeight)
  const c = Math.max(1, cols)
  const r = Math.max(1, rows)
  const cellW = (w - gap * (c - 1)) / c
  const cellH = (h - gap * (r - 1)) / r
  return { cellW, cellH, gap, rows: r, cols: c }
}
