import { expect, test, type Page } from '@playwright/test'
import {
  briefcaseSeedIncompleteMessage,
  briefcaseSeedLabel,
} from '../src/constants/appCopy'
import { STORAGE_IN_PROGRESS_KEY } from '../src/game/storage/sessionConstants'

const goldenEasy000 = '[6,3,4,3,7,7,5,6,0,1,0,5,1,2,2,4]'

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

test.describe('US1 reproducible deal', () => {
  test('same nine-digit seed yields stable identities (easy)', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    await selectDifficulty(page, 'easy')
    const seed = page.getByTestId('briefcase-seed-input')
    await seed.fill('000000000')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)

    const shell = page.getByTestId('game-canvas-shell')
    await expect(shell).toHaveAttribute('data-deal-init', 'seeded')
    const idBox = page.getByTestId('game-initial-identities')
    await expect(idBox).toHaveAttribute('data-identities', goldenEasy000)

    // Full reload clears Pinia but leaves `memo-game.v1.inProgress`; the next `/game`
    // would restore that snapshot (dealInitKind `random`) instead of reading
    // `memoDealInit` from navigation. Flush happens on a 300ms debounce — wait until
    // the snapshot exists, then remove, so a pending timer cannot repopulate after.
    await page.waitForFunction(
      (key) => localStorage.getItem(key) !== null,
      STORAGE_IN_PROGRESS_KEY,
      { timeout: 5000 },
    )
    await page.evaluate((key) => {
      localStorage.removeItem(key)
    }, STORAGE_IN_PROGRESS_KEY)

    await page.goto('/briefcase')
    await selectDifficulty(page, 'easy')
    await seed.fill('000000000')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)
    await expect(shell).toHaveAttribute('data-deal-init', 'seeded')
    await expect(idBox).toHaveAttribute('data-identities', goldenEasy000)
  })
})

test.describe('US2 optional / partial seed', () => {
  test('empty seed uses random deal marker', async ({ page }) => {
    await page.goto('/briefcase')
    await selectDifficulty(page, 'easy')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)
    await expect(page.getByTestId('game-canvas-shell')).toHaveAttribute(
      'data-deal-init',
      'random',
    )
  })

  test('partial seed: no chrome until blur; then block CTAs; clear allows start', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    await selectDifficulty(page, 'easy')
    const seed = page.getByTestId('briefcase-seed-input')
    await seed.fill('1234')
    await expect(page.getByTestId('briefcase-seed-incomplete-hint')).toHaveCount(0)
    await expect(page.getByTestId('briefcase-unlock-showcase')).toBeEnabled()
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/briefcase/)
    await seed.blur()
    await expect(page.getByTestId('briefcase-seed-incomplete-hint')).toContainText(
      briefcaseSeedIncompleteMessage,
    )
    await expect(page.getByTestId('briefcase-unlock-showcase')).toBeDisabled()
    await page.getByTestId('briefcase-unlock-showcase').click({ force: true })
    await expect(page).toHaveURL(/\/briefcase/)
    await seed.fill('')
    await expect(page.getByTestId('briefcase-unlock-showcase')).toBeEnabled()
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)
    await expect(page.getByTestId('game-canvas-shell')).toHaveAttribute(
      'data-deal-init',
      'random',
    )
  })
})

test.describe('US3 mask', () => {
  test('seed field shows xxx-xxx-xxx and accepts paste of nine digits', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    const seed = page.getByTestId('briefcase-seed-input')
    await expect(page.getByLabel(briefcaseSeedLabel)).toBeVisible()
    await seed.fill('123456789')
    await expect(seed).toHaveValue('123-456-789')
    await seed.fill('')
    await seed.fill('424242424')
    await expect(seed).toHaveValue('424-242-424')
  })

  test('Unlock showcase uses same seed as seeded deal', async ({ page }) => {
    await page.goto('/briefcase')
    await selectDifficulty(page, 'easy')
    await page.getByTestId('briefcase-seed-input').fill('000000000')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)
    await expect(page.getByTestId('game-initial-identities')).toHaveAttribute(
      'data-identities',
      goldenEasy000,
    )
  })

  test('tenth keystroke does not change value after nine digits', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    const seed = page.getByTestId('briefcase-seed-input')
    await seed.fill('123456789')
    await expect(seed).toHaveValue('123-456-789')
    await seed.press('End')
    await page.keyboard.type('0')
    await expect(seed).toHaveValue('123-456-789')
  })
})

test.describe('FR-006a in-progress seed change', () => {
  test('confirm abandon then new deal when seed changes', async ({ page }) => {
    await page.goto('/briefcase')
    await selectDifficulty(page, 'easy')
    await page.getByTestId('briefcase-seed-input').fill('000000000')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game$/)

    const idBox = page.getByTestId('game-initial-identities')
    await expect(idBox).toHaveAttribute('data-identities', goldenEasy000)

    await page.getByTestId('game-return-briefcase').click()
    await expect(page).toHaveURL(/\/briefcase$/)

    await selectDifficulty(page, 'easy')
    await page.getByTestId('briefcase-seed-input').fill('123456789')

    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page.getByTestId('memo-confirm-dialog')).toBeVisible()
    await page.getByTestId('memo-confirm-confirm').click()
    await expect(page).toHaveURL(/\/game$/)

    await expect(page.getByTestId('game-canvas-shell')).toHaveAttribute(
      'data-deal-init',
      'seeded',
    )
    await expect(idBox).not.toHaveAttribute('data-identities', goldenEasy000)
  })
})

