import { expect, test } from '@playwright/test'

import {
  BOARD_CANVAS_INSET_PX,
  BOARD_GAP_PX,
  boardStripLayout,
} from '../src/game/canvasLayout'

async function solveSeededEasyGame(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/game?difficulty=easy&seed=e2e-memo-win')
  const meta = page.getByTestId('game-grid-meta')
  const rows = Number(await meta.getAttribute('data-rows'))
  const cols = Number(await meta.getAttribute('data-cols'))
  const canvas = page.getByTestId('game-canvas')
  const debug = page.getByTestId('game-memory-debug')
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

test.describe('010 Operation Complete heading', () => {
  test('win debrief shows staggered heading test id and chars', async ({
    page,
  }) => {
    await solveSeededEasyGame(page)
    await expect(page.getByTestId('win-debrief-root')).toBeVisible()
    const heading = page.getByTestId('operation-complete-heading')
    await expect(heading).toBeVisible()
    const chars = heading.locator('.operation-complete-char')
    await expect(chars).toHaveCount(18)
  })
})
