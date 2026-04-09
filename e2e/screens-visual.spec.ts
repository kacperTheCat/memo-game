import { expect, test } from '@playwright/test'

/** Matches `STORAGE_COMPLETED_SESSIONS_KEY` in `src/game/storage/sessionConstants.ts`. */
const COMPLETED_SESSIONS_KEY = 'memo-game.v1.completedSessions'

/** Deterministic won rows so the History Ledger table is non-empty in the baseline. */
const SAMPLE_WON_SESSIONS = [
  {
    sessionId: 'visual-e2e-a',
    difficulty: 'medium' as const,
    clickCount: 48,
    activePlayMs: 132_000,
    completedAt: '2026-04-09T14:00:00.000Z',
    outcome: 'won' as const,
  },
  {
    sessionId: 'visual-e2e-b',
    difficulty: 'hard' as const,
    clickCount: 72,
    activePlayMs: 245_000,
    completedAt: '2026-04-08T09:15:00.000Z',
    outcome: 'won' as const,
  },
]

/**
 * Basic visual baselines (013). Locator screenshots reduce cross-platform text AA noise vs full page.
 */
test.describe('013 screens visual', () => {
  test('home — session history table with stats rows', async ({ page }) => {
    await page.addInitScript(
      ([key, rows]) => {
        localStorage.setItem(key, JSON.stringify(rows))
      },
      [COMPLETED_SESSIONS_KEY, SAMPLE_WON_SESSIONS],
    )
    await page.goto('/')
    const wrap = page.getByTestId('session-history-table-wrap')
    await expect(wrap).toBeVisible()
    await expect(page.getByTestId('session-history-table')).toBeVisible()
    await expect(page.getByTestId('session-history-empty')).not.toBeVisible()
    await expect(wrap).toHaveScreenshot('home-session-history-table.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.04,
    })
  })

  test('briefcase — view root', async ({ page }) => {
    await page.goto('/briefcase')
    const root = page.getByTestId('briefcase-view')
    await expect(root).toBeVisible()
    await expect(root).toHaveScreenshot('briefcase-view.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.04,
    })
  })

  test('game — canvas shell (seeded deal)', async ({ page }) => {
    await page.goto('/game?difficulty=medium&seed=111222333')
    const shell = page.getByTestId('game-canvas-shell')
    await expect(shell).toBeVisible()
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await expect(page.getByTestId('game-canvas-assets-loading')).not.toBeVisible()
    await expect(shell).toHaveScreenshot('game-canvas-shell.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.04,
    })
  })
})
