import { expect, test } from '@playwright/test'
import { primaryHeading } from '../../src/constants/appCopy'

test.describe('PWA shell (preview build)', () => {
  test('service worker registers and shell survives three offline reloads', async ({
    page,
    context,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(primaryHeading)

    await page.waitForFunction(
      async () => {
        const reg = await navigator.serviceWorker.getRegistration()
        return reg?.active != null
      },
      { timeout: 60_000 },
    )

    await page.waitForFunction(() => navigator.serviceWorker.controller != null, {
      timeout: 60_000,
    })

    await context.setOffline(true)

    for (let i = 0; i < 3; i++) {
      if (i === 0) {
        await page.goto('/', { waitUntil: 'domcontentloaded' })
      } else {
        await page.reload({ waitUntil: 'domcontentloaded' })
      }
      await expect(page.getByRole('heading', { level: 1 })).toContainText(primaryHeading, {
        timeout: 20_000,
      })
    }

    await context.setOffline(false)
  })
})
