import { lerpToward } from '@/game/animation/animationEasing'

export interface ParallaxOffset {
  ox: number
  oy: number
}

const HALF_LIFE_MS = 90

/**
 * Smooth per-tile parallax toward raw `parallaxOffset` targets (CSS px).
 */
export function smoothParallaxOffsets(
  prev: ParallaxOffset[],
  targets: ParallaxOffset[],
  dtMs: number,
): ParallaxOffset[] {
  const out: ParallaxOffset[] = []
  const n = Math.max(prev.length, targets.length)
  for (let i = 0; i < n; i++) {
    const p = prev[i] ?? { ox: 0, oy: 0 }
    const t = targets[i] ?? { ox: 0, oy: 0 }
    out.push({
      ox: lerpToward(p.ox, t.ox, dtMs, HALF_LIFE_MS),
      oy: lerpToward(p.oy, t.oy, dtMs, HALF_LIFE_MS),
    })
  }
  return out
}

/** Optional stagger: scales offset by factor in [0,1] from cell index. */
export function staggerFactor(index: number, cols: number): number {
  const col = index % Math.max(1, cols)
  const row = Math.floor(index / Math.max(1, cols))
  return 0.72 + ((col + row) % 5) * 0.06
}
