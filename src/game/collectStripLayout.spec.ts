import { describe, expect, it } from 'vitest'
import { lerpCollectRect, stripChipRect } from '@/game/collectStripLayout'

describe('collectStripLayout', () => {
  it('sizes strip chips to fit slot count', () => {
    const a = stripChipRect(300, 56, 400, 0, 3)
    const b = stripChipRect(300, 56, 400, 1, 3)
    expect(a.w).toBeGreaterThan(0)
    expect(b.x).toBeGreaterThan(a.x)
  })

  it('lerpCollectRect shrinks monotonically toward target', () => {
    const from = { x: 10, y: 10, w: 80, h: 80 }
    const r0 = lerpCollectRect(from, 200, 320, 32, 32, 0)
    const r1 = lerpCollectRect(from, 200, 320, 32, 32, 1)
    expect(r0.w).toBeGreaterThanOrEqual(r1.w)
    expect(r0.h).toBeGreaterThanOrEqual(r1.h)
    expect(r1.w).toBeCloseTo(32, 0)
  })
})
