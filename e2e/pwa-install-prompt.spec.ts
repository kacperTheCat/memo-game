import { expect, test } from '@playwright/test'

test.describe('PWA install sheet (012)', () => {
  test('synthetic beforeinstallprompt shows bottom sheet once; Not now hides after reload', async ({
    page,
  }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('memo-game.v1.pwaInstallUi')
    })
    await page.reload()

    await page.evaluate(() => {
      const ev = new Event('beforeinstallprompt', { cancelable: true })
      Object.defineProperty(ev, 'prompt', {
        value: async () => {},
        enumerable: true,
      })
      window.dispatchEvent(ev)
    })

    const sheet = page.getByTestId('pwa-install-sheet')
    await expect(sheet).toBeVisible()
    await page.getByRole('button', { name: 'Not now' }).click()
    await expect(sheet).not.toBeVisible()

    await page.reload()
    await page.evaluate(() => {
      const ev = new Event('beforeinstallprompt', { cancelable: true })
      Object.defineProperty(ev, 'prompt', {
        value: async () => {},
        enumerable: true,
      })
      window.dispatchEvent(ev)
    })
    await expect(page.getByTestId('pwa-install-sheet')).not.toBeVisible()
  })
})
