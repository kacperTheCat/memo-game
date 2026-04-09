import { describe, expect, it } from 'vitest'
import { BOARD_MAX_WIDTH_CSS } from '@/game/canvas/canvasLayout'
import { gameShellMaxWidthStyle } from '@/game/shell/gameShellLayout'

describe('gameShellLayout', () => {
  it('caps width with BOARD_MAX_WIDTH_CSS', () => {
    expect(gameShellMaxWidthStyle()).toEqual({
      maxWidth: `min(100%, ${BOARD_MAX_WIDTH_CSS}px)`,
    })
  })
})
