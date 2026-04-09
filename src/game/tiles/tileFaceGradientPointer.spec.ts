import { describe, expect, it } from 'vitest'
import {
  lerpHighlight,
  normalizedPointerInFaceRect,
  TILE_FACE_PAD,
} from '@/game/tiles/tileFaceGradientPointer'

describe('tileFaceGradientPointer', () => {
  it('maps center of inner rect to ~0.5,0.5', () => {
    const rect = { x: 10, y: 10, w: 40, h: 40 }
    const cx = 10 + TILE_FACE_PAD + (40 - TILE_FACE_PAD * 2) / 2
    const cy = 10 + TILE_FACE_PAD + (40 - TILE_FACE_PAD * 2) / 2
    const { nx, ny } = normalizedPointerInFaceRect(cx, cy, rect)
    expect(nx).toBeCloseTo(0.5, 5)
    expect(ny).toBeCloseTo(0.5, 5)
  })

  it('clamps outside rect', () => {
    const rect = { x: 0, y: 0, w: 20, h: 20 }
    expect(normalizedPointerInFaceRect(-100, -100, rect)).toEqual({
      nx: 0,
      ny: 0,
    })
    expect(normalizedPointerInFaceRect(999, 999, rect)).toEqual({
      nx: 1,
      ny: 1,
    })
  })

  it('lerpHighlight blends', () => {
    expect(
      lerpHighlight({ nx: 0, ny: 0 }, { nx: 1, ny: 1 }, 0.25),
    ).toEqual({ nx: 0.25, ny: 0.25 })
  })
})
