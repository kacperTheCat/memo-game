import { expect, test } from '@playwright/test'

/**
 * Vite dev server on loopback: debug peek remains available for local workflows.
 * Maps to spec 015 US1 acceptance scenario 2.
 */
test.describe('game debug peek (dev server)', () => {
  test('game screen shows debug peek faces control', async ({ page }) => {
    await page.goto('/game')
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await expect(page.getByTestId('game-debug-peek-faces')).toBeVisible()
  })
})
