import { expect, test } from '@playwright/test'
import { primaryHeading } from '../../src/constants/appCopy'

test.describe('quality gates (preview build)', () => {
  test('preview serves English shell', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(primaryHeading)
  })
})
