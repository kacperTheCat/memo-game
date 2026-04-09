import { expect, test, type Page } from '@playwright/test'
import {
  abandonGameConfirm,
  briefcaseUnlockAbandonInProgress,
  briefcaseUnlockSameSettingsNewDeal,
} from '../src/constants/appCopy'

async function selectDifficulty(
  page: Page,
  level: 'easy' | 'medium' | 'hard',
): Promise<void> {
  const group = page.getByTestId('briefcase-difficulty')
  const tile = group.locator('label.memo-radio-card').filter({
    has: page.locator(`input[type="radio"][value="${level}"]`),
  })
  await tile.click()
}

test.describe('009 abandon confirmation dialog', () => {
  test('US1: abandon shows in-app dialog; cancel stays on game; confirm goes to briefcase', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    await selectDifficulty(page, 'easy')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)

    const dialog = page.getByTestId('memo-confirm-dialog')
    await page.getByTestId('game-abandon-game').click()
    await expect(dialog).toBeVisible()
    await expect(page.getByTestId('memo-confirm-message')).toContainText(
      abandonGameConfirm.slice(0, 24),
    )

    await page.getByTestId('memo-confirm-cancel').click()
    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL(/\/game$/)

    await page.getByTestId('game-abandon-game').click()
    await expect(dialog).toBeVisible()
    await page.getByTestId('memo-confirm-confirm').click()
    await expect(page).toHaveURL(/\/briefcase$/)
  })

  test('US2: briefcase mismatch shows dialog; cancel stays; confirm starts game', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    await selectDifficulty(page, 'easy')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)

    await page.getByTestId('game-return-briefcase').click()
    await expect(page).toHaveURL(/\/briefcase$/)

    await selectDifficulty(page, 'hard')
    const dialog = page.getByTestId('memo-confirm-dialog')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(dialog).toBeVisible()
    await expect(page.getByTestId('memo-confirm-message')).toContainText(
      briefcaseUnlockAbandonInProgress.slice(0, 32),
    )

    await page.getByTestId('memo-confirm-cancel').click()
    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL(/\/briefcase$/)

    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(dialog).toBeVisible()
    await page.getByTestId('memo-confirm-confirm').click()
    await expect(page).toHaveURL(/\/game$/)
    await expect(page.getByTestId('game-canvas-shell')).toBeVisible()
  })

  test('US2: matching Briefcase settings still shows dialog on Unlock; confirm starts new deal', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    await selectDifficulty(page, 'easy')
    await page.getByTestId('briefcase-seed-input').fill('111-222-333')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)

    await page.getByTestId('game-return-briefcase').click()
    await expect(page).toHaveURL(/\/briefcase$/)

    const dialog = page.getByTestId('memo-confirm-dialog')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(dialog).toBeVisible()
    await expect(page.getByTestId('memo-confirm-message')).toContainText(
      briefcaseUnlockSameSettingsNewDeal.slice(0, 36),
    )

    await page.getByTestId('memo-confirm-cancel').click()
    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL(/\/briefcase$/)

    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(dialog).toBeVisible()
    await page.getByTestId('memo-confirm-confirm').click()
    await expect(page).toHaveURL(/\/game$/)
    await expect(page.getByTestId('game-canvas-shell')).toBeVisible()
  })
})
