import { expect, test } from '@playwright/test'

test.describe('010 briefcase ambience', () => {
  test('backdrop exposes animated ambience blob layer', async ({ page }) => {
    await page.goto('/briefcase')
    await expect(page.getByTestId('briefcase-ambience-blobs')).toBeVisible()
    await expect(page.getByTestId('ambient-spotlight')).toBeVisible()
  })
})
