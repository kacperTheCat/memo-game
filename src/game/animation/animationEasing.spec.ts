import { describe, expect, it } from 'vitest'
import {
  clamp01,
  easeOutCubic,
  lerp,
  lerpToward,
} from '@/game/animation/animationEasing'

describe('animationEasing', () => {
  it('clamps to 0..1', () => {
    expect(clamp01(-1)).toBe(0)
    expect(clamp01(0.3)).toBe(0.3)
    expect(clamp01(2)).toBe(1)
  })

  it('lerps linearly', () => {
    expect(lerp(0, 10, 0.5)).toBe(5)
  })

  it('easeOutCubic ends at 1', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })

  it('lerpToward approaches target', () => {
    let x = 0
    for (let i = 0; i < 40; i++) {
      x = lerpToward(x, 10, 16, 80)
    }
    expect(x).toBeGreaterThan(9.5)
  })
})
