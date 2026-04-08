import { expect, test, type Page } from '@playwright/test'

async function selectDifficulty(
  page: Page,
  level: 'easy' | 'medium' | 'hard',
) {
  const group = page.getByTestId('briefcase-difficulty')
  const tile = group.locator('label.memo-radio-card').filter({
    has: page.locator(`input[type="radio"][value="${level}"]`),
  })
  await tile.click()
}

/** Waits until the game canvas has enough non-background pixels (images painted). */
async function expectCanvasShowsTileArt(page: Page) {
  await expect.poll(
    async () =>
      page.evaluate(() => {
        const c = document.querySelector(
          '[data-testid="game-canvas"]',
        ) as HTMLCanvasElement | null
        if (!c || c.width < 8 || c.height < 8) {
          return 0
        }
        const ctx = c.getContext('2d')
        if (!ctx) {
          return 0
        }
        const { data } = ctx.getImageData(0, 0, c.width, c.height)
        let bright = 0
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i] ?? 0
          const g = data[i + 1] ?? 0
          const b = data[i + 2] ?? 0
          if (r + g + b > 100) {
            bright++
          }
        }
        return bright
      }),
    { timeout: 20_000 },
  ).toBeGreaterThan(80)
}

test.describe('CSGO tile library game grid (preview)', () => {
  test('Briefcase → Unlock showcase → Game shows grid with item tiles', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    await expect(page.getByTestId('briefcase-view')).toBeVisible()

    await selectDifficulty(page, 'medium')
    await expect(
      page.locator('[data-testid="briefcase-difficulty"] input[value="medium"]'),
    ).toBeChecked()

    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)

    const meta = page.getByTestId('game-grid-meta')
    await expect(meta).toHaveAttribute('data-rows', '6')
    await expect(meta).toHaveAttribute('data-cols', '6')
    await expect(meta).toHaveAttribute('data-cells', '36')

    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await expectCanvasShowsTileArt(page)
  })

  test('US1: Briefcase difficulty drives grid dimensions on /game', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByTestId('home-configure-game').click()
    await expect(page).toHaveURL(/\/briefcase$/)

    await selectDifficulty(page, 'hard')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)
    const meta = page.getByTestId('game-grid-meta')
    await expect(meta).toHaveAttribute('data-rows', '8')
    await expect(meta).toHaveAttribute('data-cols', '8')
    await expect(meta).toHaveAttribute('data-cells', '64')

    await page.goto('/briefcase')
    await selectDifficulty(page, 'easy')
    page.once('dialog', (d) => d.accept())
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(meta).toHaveAttribute('data-rows', '4')
    await expect(meta).toHaveAttribute('data-cols', '4')
    await expect(meta).toHaveAttribute('data-cells', '16')
  })

  test('US1: direct /game uses medium default (6×6)', async ({ page }) => {
    await page.goto('/game')
    const meta = page.getByTestId('game-grid-meta')
    await expect(meta).toHaveAttribute('data-rows', '6')
    await expect(meta).toHaveAttribute('data-cols', '6')
    await expect(meta).toHaveAttribute('data-cells', '36')
  })

  test('US2: Medium shows 6×6 and 36 cells after switching from Hard', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    await selectDifficulty(page, 'hard')
    await page.getByTestId('briefcase-unlock-showcase').click()
    const meta = page.getByTestId('game-grid-meta')
    await expect(meta).toHaveAttribute('data-cells', '64')

    await page.goto('/briefcase')
    await selectDifficulty(page, 'medium')
    page.once('dialog', (d) => d.accept())
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(meta).toHaveAttribute('data-rows', '6')
    await expect(meta).toHaveAttribute('data-cols', '6')
    await expect(meta).toHaveAttribute('data-cells', '36')
  })
})
