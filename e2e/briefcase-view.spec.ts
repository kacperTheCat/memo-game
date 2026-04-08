import { expect, test } from '@playwright/test'
import {
  briefcaseDescription,
  briefcaseDifficultyLabel,
  briefcaseSeedLabel,
  briefcaseTitle,
  briefcaseUnlockShowcase,
  navToBriefcase,
  navToGame,
  navToHome,
  primaryHeading,
} from '../src/constants/appCopy'

const phone = { width: 390, height: 844 }
const desktop = { width: 1280, height: 720 }

async function assertNoGameCanvas(page: import('@playwright/test').Page) {
  await expect(page.locator('[data-testid="game-canvas"]')).toHaveCount(0)
}

test.describe('briefcase + navigation (preview build)', () => {
  test('P1: home has no canvas; nav to Briefcase shows themed view (phone)', async ({
    page,
  }) => {
    await page.setViewportSize(phone)
    await page.goto('/')
    await assertNoGameCanvas(page)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(primaryHeading)
    await expect(page.getByTestId('nav-to-briefcase')).toBeVisible()
    await expect(page.getByTestId('nav-to-briefcase')).toContainText(navToBriefcase)
    await page.getByTestId('nav-to-briefcase').click()
    await expect(page).toHaveURL(/\/briefcase$/)
    await expect(page.getByTestId('briefcase-view')).toBeVisible()
    await expect(page.getByTestId('briefcase-backdrop')).toBeVisible()
    const briefcaseMain = page.getByTestId('briefcase-view')
    await expect(briefcaseMain.getByRole('heading', { level: 1 })).toContainText(briefcaseTitle)
    await expect(briefcaseMain.getByText(briefcaseDescription)).toBeVisible()
    await expect(briefcaseMain.getByText(briefcaseDifficultyLabel)).toBeVisible()
    const seedInput = page.getByTestId('briefcase-seed-input')
    await expect(seedInput).toBeVisible()
    await expect(page.getByLabel(briefcaseSeedLabel)).toBeVisible()
    await seedInput.fill('paste-001002003')
    await expect(seedInput).toHaveValue('001-002-003')
    await expect(page.getByTestId('briefcase-glass-panel')).toBeVisible()
    const difficultyGroup = page.getByTestId('briefcase-difficulty')
    await expect(difficultyGroup).toBeVisible()
    const hardTile = difficultyGroup.locator('label.memo-radio-card').filter({
      has: page.locator('input[type="radio"][value="hard"]'),
    })
    await hardTile.click()
    await expect(
      difficultyGroup.locator('input[type="radio"][value="hard"]'),
    ).toBeChecked()
    const showcase = page.getByTestId('briefcase-unlock-showcase')
    await expect(showcase).toBeVisible()
    await expect(showcase).toContainText(briefcaseUnlockShowcase)
    await showcase.click()
  })

  test('P1: Briefcase visible copy is English (ASCII sample)', async ({ page }) => {
    await page.goto('/briefcase')
    const text = await page.getByTestId('briefcase-view').innerText()
    expect(text.length).toBeGreaterThan(0)
    expect(/^[\t\n\r\x20-\x7E]*$/.test(text)).toBe(true)
  })

  test('P1: responsive Briefcase layout (desktop)', async ({ page }) => {
    await page.setViewportSize(desktop)
    await page.goto('/briefcase')
    await expect(page.getByTestId('briefcase-view')).toBeVisible()
    await expect(page.getByTestId('nav-to-home')).toBeVisible()
  })

  test('P1: Briefcase → home has no canvas on home', async ({ page }) => {
    await page.goto('/briefcase')
    await page.getByTestId('nav-to-home').click()
    await expect(page).toHaveURL(/\/$/)
    await assertNoGameCanvas(page)
  })

  test('P1: discoverable English nav on home and Briefcase', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('nav-to-game')).toContainText(navToGame)
    await expect(page.getByTestId('nav-to-briefcase')).toContainText(navToBriefcase)
    await page.getByTestId('nav-to-briefcase').click()
    await expect(page.getByTestId('nav-to-home')).toContainText(navToHome)
  })

  test('P1: home → game shows game-canvas', async ({ page }) => {
    await page.goto('/')
    await assertNoGameCanvas(page)
    await page.getByTestId('nav-to-game').click()
    await expect(page).toHaveURL(/\/game$/)
    await expect(page.getByTestId('game-canvas')).toBeVisible()
  })

  test('P1: deep link /briefcase → home → briefcase (no dead end)', async ({
    page,
  }) => {
    await page.goto('/briefcase')
    await expect(page.getByTestId('briefcase-view')).toBeVisible()
    await page.getByTestId('nav-to-home').click()
    await expect(page).toHaveURL(/\/$/)
    await page.getByTestId('nav-to-briefcase').click()
    await expect(page).toHaveURL(/\/briefcase$/)
  })

  test('P1: Briefcase backdrop remains with prefers-reduced-motion (scenario 8 edge)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/briefcase')
    await expect(page.getByTestId('briefcase-backdrop')).toBeVisible()
    await expect(page.getByTestId('briefcase-view')).toBeVisible()
    await expect(page.getByTestId('briefcase-glass-panel')).toBeVisible()
  })

  test('P2: nav and Briefcase surfaces share theme utility classes', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('nav-to-game')).toHaveClass(/border-memo-border/)
    await expect(page.getByTestId('nav-to-game')).toHaveClass(/bg-memo-surface/)
    await page.getByTestId('nav-to-briefcase').click()
    await expect(page.getByTestId('briefcase-backdrop')).toHaveClass(/bg-memo-bg/)
    await expect(page.getByTestId('nav-to-home')).toHaveClass(/bg-memo-surface/)
  })
})
