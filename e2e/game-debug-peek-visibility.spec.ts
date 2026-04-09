import { expect, test } from '@playwright/test'

/**
 * Production-like preview (vite build + vite preview): debug peek must not appear.
 * Maps to spec 015 US1 acceptance scenario 1.
 */
test.describe('game debug peek visibility (preview build)', () => {
  test('game screen has no debug peek faces button', async ({ page }) => {
    await page.goto('/game')
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await expect(page.getByTestId('game-debug-peek-faces')).toHaveCount(0)
  })
})
