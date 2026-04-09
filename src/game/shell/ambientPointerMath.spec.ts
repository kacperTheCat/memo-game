import { describe, expect, it } from 'vitest'
import {
  clampPointToRect,
  driftOffset2d,
  lerp2d,
  springToward2d,
} from '@/game/shell/ambientPointerMath'

describe('ambientPointerMath', () => {
  it('lerp2d interpolates endpoints', () => {
    expect(lerp2d({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)).toEqual({
      x: 5,
      y: 10,
    })
  })

  it('clampPointToRect keeps point inside', () => {
    expect(clampPointToRect(-5, 50, 0, 0, 100, 100)).toEqual({ x: 0, y: 50 })
    expect(clampPointToRect(200, 200, 0, 0, 100, 100)).toEqual({
      x: 100,
      y: 100,
    })
  })

  it('springToward2d moves toward target', () => {
    const cur = { x: 0, y: 0 }
    const tgt = { x: 100, y: 0 }
    const next = springToward2d(cur, tgt, 16, 100)
    expect(next.x).toBeGreaterThan(0)
    expect(next.x).toBeLessThan(100)
    const settle = springToward2d(tgt, tgt, 16, 100)
    expect(settle.x).toBe(100)
  })

  it('driftOffset2d stays within amplitude', () => {
    const a = 14
    for (let i = 0; i < 20; i++) {
      const d = driftOffset2d(i * 13, i * 100, a)
      expect(Math.abs(d.x)).toBeLessThanOrEqual(a + 1e-6)
      expect(Math.abs(d.y)).toBeLessThanOrEqual(a + 1e-6)
    }
  })
})
