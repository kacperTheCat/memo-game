import { expect, test } from '@playwright/test'

/** CSS px; matches `specs/013-layout-refactor-e2e/contracts/README.md`. */
const LAYOUT_TOLERANCE_PX = 2

test.describe('013 game layout balance', () => {
  test('desktop: canvas is horizontally centered in viewport', async ({
    page,
  }) => {
    await page.goto('/game')
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    const box = await page.getByTestId('game-canvas').boundingBox()
    const vp = page.viewportSize()
    expect(box).toBeTruthy()
    expect(vp).toBeTruthy()
    const canvasCenterX = box!.x + box!.width / 2
    const viewportCenterX = vp!.width / 2
    expect(Math.abs(canvasCenterX - viewportCenterX)).toBeLessThanOrEqual(
      LAYOUT_TOLERANCE_PX,
    )
  })

  test('mobile: no horizontal overflow at 390px width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/game')
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    const scrollW = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    const clientW = await page.evaluate(
      () => document.documentElement.clientWidth,
    )
    expect(scrollW).toBeLessThanOrEqual(clientW + LAYOUT_TOLERANCE_PX)
  })

  test('resize: header stays above canvas without overlap', async ({
    page,
  }) => {
    await page.goto('/game')
    for (const size of [
      { width: 390, height: 844 },
      { width: 900, height: 700 },
      { width: 1280, height: 720 },
    ]) {
      await page.setViewportSize(size)
      await expect(page.getByTestId('game-canvas')).toBeVisible()
      const header = page.locator('header')
      const canvas = page.getByTestId('game-canvas')
      const hb = await header.boundingBox()
      const cb = await canvas.boundingBox()
      expect(hb).toBeTruthy()
      expect(cb).toBeTruthy()
      expect(hb!.y + hb!.height).toBeLessThanOrEqual(
        cb!.y + LAYOUT_TOLERANCE_PX,
      )
    }
  })
})
