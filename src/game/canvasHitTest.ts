import { cellIndexFromPoint, cellRectsForGrid } from '@/game/cellRect'

/**
 * Map pointer coordinates to row-major cell index.
 * Uses canvas element CSS box (logical pixels); consistent with 2D context scaled by DPR.
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
  const { rects } = cellRectsForGrid(rect.width, rect.height, rows, cols, gap)
  return cellIndexFromPoint(x, y, rects)
}
