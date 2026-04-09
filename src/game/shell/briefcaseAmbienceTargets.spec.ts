import { describe, expect, it } from 'vitest'
import {
  randomBlobTarget,
  springScalar,
} from '@/game/shell/briefcaseAmbienceTargets'

describe('briefcaseAmbienceTargets', () => {
  it('randomBlobTarget stays in loose viewport bounds', () => {
    let i = 0
    const rng = () => {
      i += 0.11
      return (Math.sin(i) * 0.5 + 0.5) % 1
    }
    for (let k = 0; k < 30; k++) {
      const t = randomBlobTarget(rng)
      expect(t.x).toBeGreaterThanOrEqual(0.1)
      expect(t.x).toBeLessThanOrEqual(0.9)
      expect(t.y).toBeGreaterThanOrEqual(0.1)
      expect(t.y).toBeLessThanOrEqual(0.9)
      expect(t.scale).toBeGreaterThanOrEqual(0.8)
      expect(t.radiusPct).toBeGreaterThanOrEqual(35)
    }
  })

  it('springScalar converges', () => {
    let c = 0
    for (let i = 0; i < 20; i++) {
      c = springScalar(c, 10, 16, 80)
    }
    expect(c).toBeGreaterThan(9)
    expect(c).toBeLessThanOrEqual(10)
  })
})
