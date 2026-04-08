import { describe, expect, it } from 'vitest'
import {
  smoothParallaxOffsets,
  staggerFactor,
} from '@/game/tileParallaxSmooth'

describe('tileParallaxSmooth', () => {
  it('converges toward targets', () => {
    let prev: { ox: number; oy: number }[] = [{ ox: 0, oy: 0 }]
    for (let i = 0; i < 30; i++) {
      prev = smoothParallaxOffsets(prev, [{ ox: 5, oy: -3 }], 32)
    }
    expect(prev[0]!.ox).toBeGreaterThan(4.5)
    expect(prev[0]!.oy).toBeLessThan(-2.5)
  })

  it('staggerFactor is bounded', () => {
    expect(staggerFactor(0, 4)).toBeGreaterThanOrEqual(0.72)
    expect(staggerFactor(99, 4)).toBeLessThanOrEqual(1.02)
  })
})
