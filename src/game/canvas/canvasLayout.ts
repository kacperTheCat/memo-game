/** Max content width for the board shell (FR-003 desktop reference). */
export const BOARD_MAX_WIDTH_CSS = 1200

/** Gap between adjacent tiles (CSS px). */
export const BOARD_GAP_PX = 6

/** Inset from canvas edge to tile grid (CSS px); breathing room inside the canvas. */
export const BOARD_CANVAS_INSET_PX = 8

/** Minimum CSS height reserved below the grid for the collection strip (FR-009). */
export const COLLECTION_STRIP_MIN_CSS_PX = 52

export interface BoardStripLayout {
  /** Full canvas width (CSS px). */
  cssW: number
  /** Full canvas height (CSS px). */
  cssH: number
  /** Grid + inset lives in a band this tall at the top. */
  boardH: number
  /** Strip band starts at this Y (CSS px). */
  stripY: number
  stripH: number
}

/**
 * Split canvas into board band (top) and collection strip band (bottom).
 */
export function boardStripLayout(cssWidth: number, cssHeight: number): BoardStripLayout {
  const cssW = Math.max(1, cssWidth)
  const cssH = Math.max(1, cssHeight)
  const stripH = Math.min(
    cssH - 1,
    Math.max(COLLECTION_STRIP_MIN_CSS_PX, Math.round(cssH * 0.16)),
  )
  const boardH = Math.max(1, cssH - stripH)
  return { cssW, cssH, boardH, stripY: boardH, stripH }
}

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
