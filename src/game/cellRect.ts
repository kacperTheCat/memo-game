import { computeGridLayout, type GridLayoutMetrics } from '@/game/canvasLayout'

export interface CellRect {
  x: number
  y: number
  w: number
  h: number
}

export function cellRectsForGrid(
  cssWidth: number,
  cssHeight: number,
  rows: number,
  cols: number,
  gap: number,
): { metrics: GridLayoutMetrics; rects: CellRect[] } {
  const metrics = computeGridLayout(cssWidth, cssHeight, rows, cols, gap)
  const rects: CellRect[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      rects.push({
        x: col * (metrics.cellW + gap),
        y: row * (metrics.cellH + gap),
        w: metrics.cellW,
        h: metrics.cellH,
      })
    }
  }
  return { metrics, rects }
}

/** Row-major cell index from pointer position in canvas CSS pixels (top-left origin). */
export function cellIndexFromPoint(
  x: number,
  y: number,
  rects: CellRect[],
): number | null {
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i]
    if (!r) {
      continue
    }
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) {
      return i
    }
  }
  return null
}
