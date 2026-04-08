export function clamp01(t: number): number {
  if (t <= 0) {
    return 0
  }
  if (t >= 1) {
    return 1
  }
  return t
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Smooth deceleration at the end (common for UI motion). */
export function easeOutCubic(t: number): number {
  const x = clamp01(t)
  const inv = 1 - x
  return 1 - inv * inv * inv
}

export function lerpToward(
  current: number,
  target: number,
  dtMs: number,
  halfLifeMs: number,
): number {
  if (halfLifeMs <= 0) {
    return target
  }
  const k = 1 - Math.pow(0.5, dtMs / halfLifeMs)
  return lerp(current, target, clamp01(k))
}
