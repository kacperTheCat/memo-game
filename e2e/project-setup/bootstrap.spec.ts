import { expect, test } from '@playwright/test'
import { primaryHeading } from '../../src/constants/appCopy'

test.describe('bootstrap (dev server)', () => {
  test('root loads with English shell; game route shows canvas', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(primaryHeading)
    await expect(page.getByTestId('home-configure-game')).toBeVisible()
    await page.getByTestId('home-configure-game').click()
    await expect(page).toHaveURL(/\/briefcase$/)
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)
    await expect(page.getByTestId('game-canvas')).toBeVisible()
  })
})
