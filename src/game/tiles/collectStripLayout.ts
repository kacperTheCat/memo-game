import type { CellRect } from '@/game/canvas/cellRect'
import { easeOutCubic } from '@/game/animation/animationEasing'

/**
 * Target rect for one collected chip in the strip (before/after collect count includes this slot).
 */
export function stripChipRect(
  stripY: number,
  stripH: number,
  cssW: number,
  slotIndex: number,
  slotCount: number,
): CellRect {
  const margin = 8
  const innerW = Math.max(1, cssW - margin * 2)
  const maxByHeight = Math.max(24, stripH - margin * 2)
  const gaps = Math.max(0, slotCount - 1) * 4
  const w = Math.max(
    22,
    Math.min(maxByHeight, (innerW - gaps) / Math.max(1, slotCount)),
  )
  const gap = 4
  const x = margin + slotIndex * (w + gap)
  const y = stripY + (stripH - w) / 2
  return { x, y, w, h: w }
}

/**
 * Interpolate one tile from grid cell toward strip target; shrink monotonically (FR-009).
 */
export function lerpCollectRect(
  from: CellRect,
  targetCenterX: number,
  targetCenterY: number,
  endW: number,
  endH: number,
  t: number,
): CellRect {
  const e = easeOutCubic(Math.min(1, Math.max(0, t)))
  const mcx = from.x + from.w / 2
  const mcy = from.y + from.h / 2
  const nx = mcx + (targetCenterX - mcx) * e
  const ny = mcy + (targetCenterY - mcy) * e
  const w = from.w + (endW - from.w) * e
  const h = from.h + (endH - from.h) * e
  return { x: nx - w / 2, y: ny - h / 2, w, h }
}
