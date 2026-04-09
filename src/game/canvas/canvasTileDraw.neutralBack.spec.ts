import { describe, expect, it } from 'vitest'
import { drawTile } from '@/game/canvas/canvasTileDraw'

function createCtxMock() {
  const strokeStyles: string[] = []
  const ctx = {
    globalAlpha: 1,
    strokeStyle: '#000',
    fillStyle: '#000',
    save() {},
    restore() {},
    beginPath() {},
    rect() {},
    clip() {},
    fillRect() {},
    strokeRect() {
      strokeStyles.push(String(ctx.strokeStyle))
    },
    translate() {},
    scale() {},
    createLinearGradient() {
      return { addColorStop() {} }
    },
  }
  return { ctx: ctx as unknown as CanvasRenderingContext2D, strokeStyles }
}

describe('canvasTileDraw neutral concealed back', () => {
  it('does not use catalog accent for concealed stroke (FR-001)', () => {
    const { ctx, strokeStyles } = createCtxMock()
    drawTile(ctx, { x: 0, y: 0, w: 40, h: 50 }, {
      phase: 'concealed',
      img: undefined,
      catalogColor: '#ff0000',
      rarity: 'Covert',
      parallax: { ox: 0, oy: 0 },
      reducedMotion: true,
      reveal01: 1,
      matchFade01: 0,
      shakePx: 0,
      forceShowFace: false,
    })
    expect(strokeStyles.some((s) => s === '#ff0000')).toBe(false)
    expect(strokeStyles.some((s) => s.includes('255, 0, 0'))).toBe(false)
  })
})
