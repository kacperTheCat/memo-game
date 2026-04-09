import { expect, test } from '@playwright/test'

/** US3 Playwright: total tile count matches difficulty (constitution §V / C1). */

async function selectDifficulty(
  page: import('@playwright/test').Page,
  level: 'easy' | 'medium' | 'hard',
) {
  const group = page.getByTestId('briefcase-difficulty')
  const tile = group.locator('label.memo-radio-card').filter({
    has: page.locator(`input[type="radio"][value="${level}"]`),
  })
  await tile.click()
}

test.describe('tile library validation (preview)', () => {
  test('US3: data-cells is 16 / 36 / 64 for Easy / Medium / Hard', async ({
    page,
  }) => {
    const meta = page.getByTestId('game-grid-meta')
    const steps = [
      { level: 'easy' as const, cells: '16' },
      { level: 'medium' as const, cells: '36' },
      { level: 'hard' as const, cells: '64' },
    ]

    for (let i = 0; i < steps.length; i++) {
      const { level, cells } = steps[i]!
      if (i === 0) {
        await page.goto('/briefcase')
      } else {
        await page.getByTestId('game-return-briefcase').click()
        await expect(page).toHaveURL(/\/briefcase$/)
      }

      await selectDifficulty(page, level)
      await page.getByTestId('briefcase-unlock-showcase').click()

      const mismatchDialog = page.getByTestId('memo-confirm-dialog')
      const dialogShown = await mismatchDialog
        .waitFor({ state: 'visible', timeout: 2500 })
        .then(() => true)
        .catch(() => false)
      if (dialogShown) {
        await page.getByTestId('memo-confirm-confirm').click()
      }

      await expect(page).toHaveURL(/\/game$/)
      await expect(meta).toHaveAttribute('data-cells', cells)
    }
  })
})
