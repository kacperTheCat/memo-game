import { expect, test } from '@playwright/test'

import {
  BOARD_CANVAS_INSET_PX,
  BOARD_GAP_PX,
  boardStripLayout,
} from '../src/game/canvas/canvasLayout'

test.describe('010 game card pointer gradient', () => {
  test('game shell and canvas visible after starting play', async ({
    page,
  }) => {
    await page.goto('/game')
    await expect(page.getByTestId('game-canvas-shell')).toBeVisible()
    await expect(page.getByTestId('game-canvas')).toBeVisible()
  })

  test('revealed tile keeps board interactive for pointer-driven paint', async ({
    page,
  }) => {
    await page.goto('/game')
    const meta = page.getByTestId('game-grid-meta')
    const rows = Number(await meta.getAttribute('data-rows'))
    const cols = Number(await meta.getAttribute('data-cols'))
    const canvas = page.getByTestId('game-canvas')
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    const { boardH } = boardStripLayout(box!.width, box!.height)
    const iw = box!.width - 2 * BOARD_CANVAS_INSET_PX
    const ih = boardH - 2 * BOARD_CANVAS_INSET_PX
    const cellW = (iw - BOARD_GAP_PX * (cols - 1)) / cols
    const cellH = (ih - BOARD_GAP_PX * (rows - 1)) / rows
    await canvas.click({
      position: {
        x: BOARD_CANVAS_INSET_PX + cellW * 0.5,
        y: BOARD_CANVAS_INSET_PX + cellH * 0.5,
      },
    })
    await expect
      .poll(async () =>
        page.getByTestId('game-memory-debug').getAttribute('data-revealed'),
      )
      .toBe('1')
    await page.mouse.move(
      box!.x + BOARD_CANVAS_INSET_PX + cellW,
      box!.y + BOARD_CANVAS_INSET_PX + cellH,
    )
    await expect(page.getByTestId('game-canvas')).toBeVisible()
  })
})
