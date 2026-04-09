const DEFAULT_MAX = 6

/**
 * Sub-pixel offset for drawing tile face based on pointer vs cell center.
 */
export function parallaxOffset(
  pointerX: number,
  pointerY: number,
  cellCenterX: number,
  cellCenterY: number,
  maxPx: number = DEFAULT_MAX,
): { ox: number; oy: number } {
  const dx = pointerX - cellCenterX
  const dy = pointerY - cellCenterY
  const len = Math.hypot(dx, dy) || 1
  const nx = dx / len
  const ny = dy / len
  const strength = Math.min(1, len / 200)
  return {
    ox: nx * maxPx * strength,
    oy: ny * maxPx * strength,
  }
}
