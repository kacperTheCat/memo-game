import { expect, test, type Page } from '@playwright/test'
import {
  BOARD_CANVAS_INSET_PX,
  BOARD_GAP_PX,
  boardStripLayout,
} from '../src/game/canvas/canvasLayout'

function attachConsoleErrorCollector(page: Page): { assertClean: () => void } {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  page.on('pageerror', (err) => {
    errors.push(err.message)
  })
  return {
    assertClean: () => {
      expect(errors, errors.join('\n')).toEqual([])
    },
  }
}

async function solveSeededEasyGame(page: Page): Promise<void> {
  await page.goto('/game?difficulty=easy&seed=e2e-memo-win')
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

test.describe('game sound effects (011)', () => {
  test('seeded easy playthrough reaches debrief without console errors', async ({
    page,
  }) => {
    const { assertClean } = attachConsoleErrorCollector(page)
    await solveSeededEasyGame(page)
    await expect(page.getByTestId('win-debrief-root')).toBeVisible()
    assertClean()
  })

  test('mismatch then resolve: no console errors', async ({ page }) => {
    const { assertClean } = attachConsoleErrorCollector(page)
    await page.goto('/game?difficulty=easy&seed=e2e-memo-win')
    const meta = page.getByTestId('game-grid-meta')
    const cols = Number(await meta.getAttribute('data-cols'))
    const canvas = page.getByTestId('game-canvas')
    const debug = page.getByTestId('game-memory-debug')
    await expect
      .poll(async () => (await debug.getAttribute('data-identities'))?.length ?? 0)
      .toBeGreaterThan(0)
    const raw = await debug.getAttribute('data-identities')
    expect(raw).toBeTruthy()
    const ids = raw!.split(',').map((x) => Number(x.trim()))
    let a = 0
    let b = 1
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        if (ids[i] !== ids[j]) {
          a = i
          b = j
          i = ids.length
          break
        }
      }
    }

    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    const rows = Number(await meta.getAttribute('data-rows'))
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

    await clickCell(a)
    await clickCell(b)
    await expect
      .poll(async () => debug.getAttribute('data-revealed'))
      .toBe('2')
    await expect
      .poll(async () => debug.getAttribute('data-revealed'))
      .toBe('0')
    assertClean()
  })

  test('abandon dialog cancel: chrome buttons without console errors', async ({
    page,
  }) => {
    const { assertClean } = attachConsoleErrorCollector(page)
    await page.goto('/game?difficulty=easy&seed=e2e-sfx-abandon')
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    await page.getByTestId('game-abandon-game').click()
    await expect(page.getByTestId('memo-confirm-dialog')).toBeVisible()
    await page.getByTestId('memo-confirm-cancel').click()
    await expect(page.getByTestId('memo-confirm-dialog')).not.toBeVisible()
    await page.getByTestId('game-return-briefcase').click()
    await expect(page).toHaveURL(/\/briefcase$/)
    assertClean()
  })

  test('briefcase unlock navigates to game without console errors', async ({
    page,
  }) => {
    const { assertClean } = attachConsoleErrorCollector(page)
    await page.goto('/briefcase')
    await page.getByTestId('briefcase-unlock-showcase').click()
    await expect(page).toHaveURL(/\/game/)
    await expect(page.getByTestId('game-canvas')).toBeVisible()
    assertClean()
  })

  test('home Configure New Game and briefcase difficulty change: no console errors', async ({
    page,
  }) => {
    const { assertClean } = attachConsoleErrorCollector(page)
    await page.goto('/')
    await page.getByTestId('home-configure-game').click()
    await expect(page).toHaveURL(/\/briefcase$/)
    const group = page.getByTestId('briefcase-difficulty')
    // Inputs are `sr-only`; `has` is scoped per label (do not use `group.locator` inside `has`).
    await group
      .locator('label.memo-radio-card')
      .filter({ has: page.locator('input[type="radio"][value="hard"]') })
      .click()
    await expect(
      group.locator('input[type="radio"][value="hard"]'),
    ).toBeChecked()
    assertClean()
  })
})
