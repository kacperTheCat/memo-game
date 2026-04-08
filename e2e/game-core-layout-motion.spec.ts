import { expect, test } from '@playwright/test'

test.describe('game core layout', () => {
  test('grid meta matches medium default on /game', async ({ page }) => {
    await page.goto('/game')
    const meta = page.getByTestId('game-grid-meta')
    await expect(meta).toHaveAttribute('data-rows', '6')
    await expect(meta).toHaveAttribute('data-cols', '6')
    await expect(meta).toHaveAttribute('data-cells', '36')
  })

  test('narrow viewport still shows canvas', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 900 })
    await page.goto('/game')
    await expect(page.getByTestId('game-canvas')).toBeVisible()
  })
})
