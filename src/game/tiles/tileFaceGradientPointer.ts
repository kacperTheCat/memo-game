import type { CellRect } from '@/game/canvas/cellRect'

/** Must match concealed/face padding in `canvasTileDraw.ts`. */
export const TILE_FACE_PAD = 3

export interface NormalizedHighlight {
  nx: number
  ny: number
}

/**
 * Pointer position in CSS pixels vs cell rect → normalized highlight center in face inner box.
 */
export function normalizedPointerInFaceRect(
  px: number,
  py: number,
  rect: CellRect,
  pad: number = TILE_FACE_PAD,
): NormalizedHighlight {
  const ix = rect.x + pad
  const iy = rect.y + pad
  const innerW = rect.w - pad * 2
  const innerH = rect.h - pad * 2
  if (innerW <= 0 || innerH <= 0) {
    return { nx: 0.5, ny: 0.5 }
  }
  return {
    nx: Math.min(1, Math.max(0, (px - ix) / innerW)),
    ny: Math.min(1, Math.max(0, (py - iy) / innerH)),
  }
}

export function lerpHighlight(
  a: NormalizedHighlight,
  b: NormalizedHighlight,
  t: number,
): NormalizedHighlight {
  const k = Math.min(1, Math.max(0, t))
  return {
    nx: a.nx + (b.nx - a.nx) * k,
    ny: a.ny + (b.ny - a.ny) * k,
  }
}
