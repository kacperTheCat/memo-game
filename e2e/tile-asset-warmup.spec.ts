import { expect, test } from '@playwright/test'

/**
 * 018-tile-asset-warmup: canvas busy/overlay settles; hub visit before game.
 * Maps to specs/018-tile-asset-warmup/spec.md US1 + US2.
 */
test.describe('018 tile asset warmup', () => {
  test('direct /game: canvas leaves busy state and loading overlay hides', async ({
    page,
  }) => {
    await page.goto('/game?difficulty=medium&seed=111222333')
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await expect(page.getByTestId('game-canvas')).toHaveAttribute(
      'aria-busy',
      'false',
      { timeout: 15_000 },
    )
    await expect(
      page.getByTestId('game-canvas-assets-loading'),
    ).not.toBeVisible()
  })

  test('home then briefcase then game: canvas settles', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('home-configure-game')).toBeVisible()
    await page.goto('/briefcase')
    await expect(page.getByTestId('briefcase-view')).toBeVisible()
    await page.goto('/game?difficulty=easy&seed=222333444')
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await expect(page.getByTestId('game-canvas')).toHaveAttribute(
      'aria-busy',
      'false',
      { timeout: 15_000 },
    )
    await expect(
      page.getByTestId('game-canvas-assets-loading'),
    ).not.toBeVisible()
  })
})
