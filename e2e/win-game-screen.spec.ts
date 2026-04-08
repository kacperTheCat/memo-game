import { expect, test } from '@playwright/test'

const GAP = 6

async function solveSeededEasyGame(
  page: import('@playwright/test').Page,
  options?: { skipGoto?: boolean },
): Promise<void> {
  if (!options?.skipGoto) {
    await page.goto('/game?difficulty=easy&seed=e2e-memo-win')
  }
  const meta = page.getByTestId('game-grid-meta')
  const rows = Number(await meta.getAttribute('data-rows'))
  const cols = Number(await meta.getAttribute('data-cols'))
  const canvas = page.getByTestId('game-canvas')
  const debug = page.getByTestId('game-memory-debug')
  await expect(canvas).toBeVisible()
  await expect
    .poll(async () => (await debug.getAttribute('data-identities'))?.length ?? 0)
    .toBeGreaterThan(0)

  const raw = await debug.getAttribute('data-identities')
  expect(raw).toBeTruthy()
  const ids = raw!.split(',').map((x) => Number(x.trim()))
  const byId = new Map<number, number[]>()
  ids.forEach((id, cellIdx) => {
    const arr = byId.get(id) ?? []
    arr.push(cellIdx)
    byId.set(id, arr)
  })

  const box = await canvas.boundingBox()
  expect(box).toBeTruthy()
  const cellW = (box!.width - GAP * (cols - 1)) / cols
  const cellH = (box!.height - GAP * (rows - 1)) / rows

  async function clickCell(cellIndex: number): Promise<void> {
    const row = Math.floor(cellIndex / cols)
    const col = cellIndex % cols
    const x = col * (cellW + GAP) + cellW / 2
    const y = row * (cellH + GAP) + cellH / 2
    await canvas.click({ position: { x, y } })
  }

  for (const [, idxs] of byId) {
    if (idxs.length >= 2) {
      await clickCell(idxs[0]!)
      await clickCell(idxs[1]!)
    }
  }
}

test.describe('win debrief (006)', () => {
  test('seeded easy playthrough reaches debrief on /game with summary testids', async ({
    page,
  }) => {
    await solveSeededEasyGame(page)
    await expect(page).toHaveURL(/\/game/)
    await expect(page.getByTestId('win-debrief-root')).toBeVisible()
    await expect(page.getByTestId('win-summary-time')).toBeVisible()
    await expect(page.getByTestId('win-summary-moves')).toBeVisible()
  })

  test('history table has column headers after win', async ({ page }) => {
    await solveSeededEasyGame(page)
    const table = page.getByTestId('win-history-table')
    await expect(table.getByRole('columnheader', { name: 'Date' })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: 'Difficulty' })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: 'Time' })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: 'Moves' })).toBeVisible()
  })

  test('return to briefcase navigates away from /game', async ({ page }) => {
    await solveSeededEasyGame(page)
    await page.getByTestId('win-return-briefcase').click()
    await expect(page).toHaveURL(/\/briefcase/)
  })

  test('reload on debrief shows board at same difficulty, not debrief (FR-013)', async ({
    page,
  }) => {
    await solveSeededEasyGame(page)
    await expect(page.getByTestId('win-debrief-root')).toBeVisible()
    await page.reload()
    await expect(page).toHaveURL(/\/game/)
    await expect(page.getByTestId('win-debrief-root')).not.toBeVisible()
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    const meta = page.getByTestId('game-grid-meta')
    await expect(meta).toHaveAttribute('data-rows', '4')
    await expect(meta).toHaveAttribute('data-cols', '4')
  })

  test('goto briefcase from debrief then /game shows board until new win (FR-014)', async ({
    page,
  }) => {
    await solveSeededEasyGame(page)
    await page.goto('/briefcase')
    await expect(page).toHaveURL(/\/briefcase/)
    await page.goto('/game?difficulty=easy&seed=e2e-memo-win')
    await expect(page.getByTestId('win-debrief-root')).not.toBeVisible()
    await expect(page.getByTestId('game-canvas')).toBeVisible()
  })

  test('play again returns to board with canvas', async ({ page }) => {
    await solveSeededEasyGame(page)
    await page.getByTestId('win-play-again').click()
    await expect(page).toHaveURL(/\/game/)
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await expect(page.getByTestId('win-debrief-root')).not.toBeVisible()
  })

  test('play again shuffles to a different deal than the completed seeded round (SC-002)', async ({
    page,
  }) => {
    await page.goto('/game?difficulty=easy&seed=e2e-memo-win')
    const debug = page.getByTestId('game-memory-debug')
    await expect
      .poll(async () => (await debug.getAttribute('data-identities'))?.length ?? 0)
      .toBeGreaterThan(0)
    const layoutBeforeWin = await debug.getAttribute('data-identities')
    expect(layoutBeforeWin).toBeTruthy()

    await solveSeededEasyGame(page, { skipGoto: true })
    await page.getByTestId('win-play-again').click()
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await expect
      .poll(async () => (await debug.getAttribute('data-identities'))?.length ?? 0)
      .toBeGreaterThan(0)
    const layoutAfterPlayAgain = await debug.getAttribute('data-identities')
    expect(layoutAfterPlayAgain).toBeTruthy()
    expect(layoutAfterPlayAgain).not.toBe(layoutBeforeWin)
  })
})
