import { BOARD_CANVAS_INSET_PX, boardStripLayout } from '@/game/canvasLayout'
import { cellIndexFromPoint, cellRectsForGrid } from '@/game/cellRect'

/**
 * Map pointer coordinates to row-major cell index.
 * Uses canvas element CSS box (logical pixels); consistent with 2D context scaled by DPR.
 * Clicks in the collection strip band (bottom) return null (FR-009).
 */
export function cellIndexFromPointer(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  rows: number,
  cols: number,
  gap: number,
): number | null {
  const rect = canvas.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top
  const { boardH } = boardStripLayout(rect.width, rect.height)
  if (y >= boardH) return null
  const { rects } = cellRectsForGrid(
    rect.width,
    boardH,
    rows,
    cols,
    gap,
    BOARD_CANVAS_INSET_PX,
  )
  return cellIndexFromPoint(x, y, rects)
}
