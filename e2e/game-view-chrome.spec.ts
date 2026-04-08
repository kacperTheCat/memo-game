import { expect, test } from '@playwright/test'
import { navAbandonGame, navReturnToBriefcase } from '../src/constants/appCopy'

test.describe('game view chrome — active play (007)', () => {
  test('shows Return to Briefcase and Abandon only; no legacy home nav', async ({
    page,
  }) => {
    await page.goto('/game?difficulty=easy&seed=e2e-chrome')
    await expect(page.getByTestId('game-canvas')).toBeVisible()

    const returnBtn = page.getByTestId('game-return-briefcase')
    const abandon = page.getByTestId('game-abandon-game')
    await expect(returnBtn).toBeVisible()
    await expect(abandon).toBeVisible()
    await expect(returnBtn).toContainText(navReturnToBriefcase)
    await expect(abandon).toContainText(navAbandonGame)

    await expect(page.getByTestId('nav-to-home')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Memory game' })).toHaveCount(0)
  })

  test('Return to Briefcase navigates to briefcase without clearing in-progress (resume)', async ({
    page,
  }) => {
    await page.goto('/game?difficulty=easy&seed=e2e-chrome-resume')
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await page.getByTestId('game-return-briefcase').click()
    await expect(page).toHaveURL(/\/briefcase$/)

    await page.getByTestId('briefcase-return-game').click()
    await expect(page).toHaveURL(/\/game$/)
    await expect(page.getByTestId('game-canvas')).toBeVisible()
  })
})
