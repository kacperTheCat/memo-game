import { expect, test } from '@playwright/test'
import { primaryHeading } from '../../src/constants/appCopy'

test.describe('bootstrap (dev server)', () => {
  test('root loads and shows English shell copy', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(primaryHeading)
    await expect(page.locator('[data-testid="game-canvas-shell"] canvas')).toBeVisible()
  })
})
