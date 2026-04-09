/** Shared smoothing for ambient spotlight (010). */

export interface Vec2 {
  x: number
  y: number
}

export function lerp2d(a: Vec2, b: Vec2, t: number): Vec2 {
  const k = Math.min(1, Math.max(0, t))
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }
}

export function clampPointToRect(
  px: number,
  py: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
): Vec2 {
  return {
    x: Math.min(right, Math.max(left, px)),
    y: Math.min(bottom, Math.max(top, py)),
  }
}

/**
 * Exponential move toward target. `tauMs` is time constant (~63% per tau at fixed dt).
 */
export function springToward2d(
  current: Vec2,
  target: Vec2,
  dtMs: number,
  tauMs: number,
): Vec2 {
  if (tauMs <= 0) {
    return { x: target.x, y: target.y }
  }
  const k = 1 - Math.exp(-dtMs / tauMs)
  return {
    x: current.x + (target.x - current.x) * k,
    y: current.y + (target.y - current.y) * k,
  }
}

/** Subtle non-stable wobble so the centroid is not rigidly locked to input. */
export function driftOffset2d(
  seed: number,
  timeMs: number,
  amplitude: number,
): Vec2 {
  const t = timeMs * 0.00065
  return {
    x: Math.sin(seed * 1.71 + t) * amplitude,
    y: Math.cos(seed * 2.29 + t * 0.88) * amplitude,
  }
}
