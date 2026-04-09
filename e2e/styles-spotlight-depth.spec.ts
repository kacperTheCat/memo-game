import { expect, test } from '@playwright/test'

import {
  BOARD_CANVAS_INSET_PX,
  BOARD_GAP_PX,
  boardStripLayout,
} from '../src/game/canvasLayout'

test.describe('010 ambient spotlight depth', () => {
  test('home shows ambient spotlight below main column in DOM order', async ({
    page,
  }) => {
    await page.goto('/')
    const spot = page.getByTestId('ambient-spotlight')
    const grain = page.getByTestId('hub-grain-layer')
    const row = page.getByTestId('home-action-row')
    await expect(spot).toBeVisible()
    await expect(grain).toBeVisible()
    await expect(row).toBeVisible()

    const spotBeforeContent = await page.evaluate(() => {
      const s = document.querySelector('[data-testid="ambient-spotlight"]')
      const r = document.querySelector('[data-testid="home-action-row"]')
      if (!s || !r) {
        return false
      }
      return (
        s.compareDocumentPosition(r) & Node.DOCUMENT_POSITION_FOLLOWING
      ) !== 0
    })
    expect(spotBeforeContent).toBe(true)
  })

  test('spotlight viewport percents track pointer with wide document (overflow)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 480 })
    await page.goto('/')
    await page.evaluate(() => {
      document.documentElement.style.minWidth = '2400px'
    })
    await page.mouse.move(320, 240)
    const spot = page.locator('[data-testid="ambient-spotlight"]')
    await expect(spot).toHaveAttribute('data-ambient-spotlight-active', 'true', {
      timeout: 6000,
    })
    await expect(spot).toHaveAttribute('data-memo-spotlight-vp-x', '50')
    await expect(spot).toHaveAttribute('data-memo-spotlight-vp-y', '50')
    await page.evaluate(() => {
      document.documentElement.style.minWidth = ''
    })
  })

  test('spotlight deactivates after mouse idle then reactivates on move', async ({
    page,
  }) => {
    await page.goto('/')
    const spot = page.locator('[data-testid="ambient-spotlight"]')
    await page.mouse.move(120, 140)
    await expect(spot).toHaveAttribute('data-ambient-spotlight-active', 'true', {
      timeout: 5000,
    })
    await page.waitForTimeout(1400)
    await expect(spot).toHaveAttribute('data-ambient-spotlight-active', 'false')
    await page.mouse.move(125, 145)
    await expect(spot).toHaveAttribute('data-ambient-spotlight-active', 'true', {
      timeout: 5000,
    })
  })

  test('briefcase shows ambient spotlight', async ({ page }) => {
    await page.goto('/briefcase')
    await expect(page.getByTestId('ambient-spotlight')).toBeVisible()
    await expect(page.getByTestId('briefcase-glass-panel')).toBeVisible()
  })

  test('win debrief shows ambient spotlight', async ({ page }) => {
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
    await expect(page.getByTestId('win-debrief-root')).toBeVisible()
    await expect(page.getByTestId('ambient-spotlight')).toBeVisible()
  })
})
