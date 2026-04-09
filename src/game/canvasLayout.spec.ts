import { describe, expect, it } from 'vitest'
import {
  BOARD_GAP_PX,
  COLLECTION_STRIP_MIN_CSS_PX,
  boardStripLayout,
  computeGridLayout,
} from '@/game/canvasLayout'

describe('canvasLayout', () => {
  it('shrinks cell size when container shrinks (fixed grid)', () => {
    const large = computeGridLayout(800, 800, 4, 4, BOARD_GAP_PX)
    const small = computeGridLayout(400, 400, 4, 4, BOARD_GAP_PX)
    expect(small.cellW).toBeLessThan(large.cellW)
    expect(small.cellH).toBeLessThan(large.cellH)
  })

  it('accounts for gap between cells', () => {
    const m = computeGridLayout(100, 100, 2, 2, 10)
    // 2 cells + 1 gap = width => cell = (100-10)/2 = 45
    expect(m.cellW).toBe(45)
    expect(m.cellH).toBe(45)
  })

  it('reserves a strip band and board height for the grid', () => {
    const bs = boardStripLayout(400, 400)
    expect(bs.stripH).toBeGreaterThanOrEqual(COLLECTION_STRIP_MIN_CSS_PX)
    expect(bs.boardH + bs.stripH).toBe(400)
    expect(bs.stripY).toBe(bs.boardH)
  })
})
