import { expect, test } from '@playwright/test'
import {
  navConfigureGame,
  navReturnToGame,
  primaryHeading,
} from '../src/constants/appCopy'

test.describe('home hub layout (007)', () => {
  test('grain layer, ledger table, Configure New Game; no Return to Game without session', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('hub-grain-layer')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(primaryHeading)
    await expect(page.getByTestId('session-history-table')).toBeVisible()
    const configure = page.getByTestId('home-configure-game')
    await expect(configure).toBeVisible()
    await expect(configure).toContainText(navConfigureGame)
    await expect(configure).toHaveClass(/bg-memo-accent/)
    await expect(page.getByTestId('home-return-game')).toHaveCount(0)
  })

  test('Return to Game appears after leaving active match via Return to Briefcase', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)
    await page.getByTestId('game-return-briefcase').click()
    await expect(page).toHaveURL(/\/briefcase$/)

    await page.getByTestId('briefcase-return-home').click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByTestId('hub-grain-layer')).toBeVisible()
    const returnGame = page.getByTestId('home-return-game')
    await expect(returnGame).toBeVisible()
    await expect(returnGame).toContainText(navReturnToGame)
    await expect(returnGame).not.toHaveClass(/bg-memo-accent/)
  })
})
