import { expect, test } from '@playwright/test'

const GAP = 6

test.describe('game core playthrough', () => {
  test('single tile pick reveals one face', async ({ page }) => {
    await page.goto('/game')
    const meta = page.getByTestId('game-grid-meta')
    const rows = Number(await meta.getAttribute('data-rows'))
    const cols = Number(await meta.getAttribute('data-cols'))
    const canvas = page.getByTestId('game-canvas')
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    const cellW = (box!.width - GAP * (cols - 1)) / cols
    const cellH = (box!.height - GAP * (rows - 1)) / rows
    await canvas.click({ position: { x: cellW * 0.5, y: cellH * 0.5 } })
    await expect
      .poll(async () =>
        page.getByTestId('game-memory-debug').getAttribute('data-revealed'),
      )
      .toBe('1')
  })
})
