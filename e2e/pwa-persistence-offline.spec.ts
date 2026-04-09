import { expect, test } from '@playwright/test'

import {
  BOARD_CANVAS_INSET_PX,
  BOARD_GAP_PX,
  boardStripLayout,
} from '../src/game/canvas/canvasLayout'

async function waitForServiceWorkerActive(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect
    .poll(
      async () =>
        page.evaluate(async () => {
          const reg = await navigator.serviceWorker.getRegistration()
          return reg?.active != null
        }),
      { timeout: 90_000 },
    )
    .toBeTruthy()
}

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
  const { boardH } = boardStripLayout(box!.width, box!.height)
  const iw = box!.width - 2 * BOARD_CANVAS_INSET_PX
  const ih = boardH - 2 * BOARD_CANVAS_INSET_PX
  const cellW = (iw - BOARD_GAP_PX * (cols - 1)) / cols
  const cellH = (ih - BOARD_GAP_PX * (rows - 1)) / rows

  async function clickCell(cellIndex: number): Promise<void> {
    const row = Math.floor(cellIndex / cols)
    const col = cellIndex % cols
    const x =
      BOARD_CANVAS_INSET_PX + col * (cellW + BOARD_GAP_PX) + cellW / 2
    const y =
      BOARD_CANVAS_INSET_PX + row * (cellH + BOARD_GAP_PX) + cellH / 2
    await canvas.click({ position: { x, y } })
  }

  for (const [, idxs] of byId) {
    if (idxs.length >= 2) {
      await clickCell(idxs[0]!)
      await clickCell(idxs[1]!)
    }
  }
}

test.describe('PWA persistence and offline (012)', () => {
  test('briefcase difficulty survives full reload', async ({ page }) => {
    await page.goto('/briefcase')
    const group = page.getByTestId('briefcase-difficulty')
    await group
      .locator('label.memo-radio-card')
      .filter({ has: page.locator('input[type="radio"][value="hard"]') })
      .click()
    await page.reload()
    await expect(page.locator('input[type="radio"][value="hard"]')).toBeChecked()
  })

  test('briefcase seed field survives full reload', async ({ page }) => {
    await page.goto('/briefcase')
    await page.getByTestId('briefcase-seed-input').fill('123456789')
    await page.reload()
    await expect(page.getByTestId('briefcase-seed-input')).toHaveValue('123-456-789')
  })

  test('in-progress matched progress survives reload on /game', async ({ page }) => {
    await page.goto('/game?difficulty=easy&seed=e2e-memo-win')
    const canvas = page.getByTestId('game-canvas')
    const debug = page.getByTestId('game-memory-debug')
    await expect(canvas).toBeVisible()
    const meta = page.getByTestId('game-grid-meta')
    const rows = Number(await meta.getAttribute('data-rows'))
    const cols = Number(await meta.getAttribute('data-cols'))
    const raw = await debug.getAttribute('data-identities')
    expect(raw).toBeTruthy()
    const ids = raw!.split(',').map((x) => Number(x.trim()))
    const byId = new Map<number, number[]>()
    ids.forEach((id, cellIdx) => {
      const arr = byId.get(id) ?? []
      arr.push(cellIdx)
      byId.set(id, arr)
    })
    const firstPair = [...byId.values()].find((idxs) => idxs.length >= 2)
    expect(firstPair).toBeTruthy()
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    const { boardH } = boardStripLayout(box!.width, box!.height)
    const iw = box!.width - 2 * BOARD_CANVAS_INSET_PX
    const ih = boardH - 2 * BOARD_CANVAS_INSET_PX
    const cellW = (iw - BOARD_GAP_PX * (cols - 1)) / cols
    const cellH = (ih - BOARD_GAP_PX * (rows - 1)) / rows
    async function clickCell(cellIndex: number): Promise<void> {
      const row = Math.floor(cellIndex / cols)
      const col = cellIndex % cols
      const x =
        BOARD_CANVAS_INSET_PX + col * (cellW + BOARD_GAP_PX) + cellW / 2
      const y =
        BOARD_CANVAS_INSET_PX + row * (cellH + BOARD_GAP_PX) + cellH / 2
      await canvas.click({ position: { x, y } })
    }
    await clickCell(firstPair![0]!)
    await clickCell(firstPair![1]!)
    await expect(debug).toHaveAttribute('data-matched', /^(2|4)$/)
    const matchedBefore = await debug.getAttribute('data-matched')
    await page.reload()
    await expect(debug).toHaveAttribute('data-matched', matchedBefore!)
  })

  test('completed session count in localStorage survives reload after win', async ({ page }) => {
    await solveSeededEasyGame(page)
    await expect(page.getByTestId('win-debrief-root')).toBeVisible()
    const ledgerLen = await page.evaluate(() => {
      const r = localStorage.getItem('memo-game.v1.completedSessions')
      return r ? (JSON.parse(r) as unknown[]).length : 0
    })
    expect(ledgerLen).toBeGreaterThan(0)
    await page.reload()
    const after = await page.evaluate(() => {
      const r = localStorage.getItem('memo-game.v1.completedSessions')
      return r ? (JSON.parse(r) as unknown[]).length : 0
    })
    expect(after).toBe(ledgerLen)
  })

  test('seeded easy round completes offline after SW precache', async ({
    page,
    context,
  }) => {
    await waitForServiceWorkerActive(page)
    await page.goto('/game?difficulty=easy&seed=e2e-memo-win')
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await context.setOffline(true)
    await page.reload()
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await solveSeededEasyGame(page, { skipGoto: true })
    await expect(page.getByTestId('win-debrief-root')).toBeVisible()
    await context.setOffline(false)
  })
})
