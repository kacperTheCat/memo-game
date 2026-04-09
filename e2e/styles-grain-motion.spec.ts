import { expect, test } from '@playwright/test'

test.describe('010 hub grain motion', () => {
  test('home hub grain layer is present', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('hub-grain-layer')).toBeVisible()
  })

  test('grain noise node exists under briefcase backdrop', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    await expect(page.getByTestId('hub-grain-noise')).toBeVisible()
  })
})
