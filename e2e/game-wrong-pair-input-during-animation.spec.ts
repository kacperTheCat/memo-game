import { expect, test } from '@playwright/test'
import {
  BOARD_CANVAS_INSET_PX,
  BOARD_GAP_PX,
  boardStripLayout,
} from '../src/game/canvasLayout'

test.describe('wrong-pair input during mismatch animation (016)', () => {
  test('third concealed pick accepted before mismatch timer finishes', async ({
    page,
  }) => {
    await page.goto('/game?difficulty=easy&seed=e2e-memo-win')
    const meta = page.getByTestId('game-grid-meta')
    const cols = Number(await meta.getAttribute('data-cols'))
    const rows = Number(await meta.getAttribute('data-rows'))
    const canvas = page.getByTestId('game-canvas')
    const debug = page.getByTestId('game-memory-debug')
    await expect(canvas).toBeVisible()
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
    let c = 0
    for (let k = 0; k < ids.length; k++) {
      if (k !== a && k !== b) {
        c = k
        break
      }
    }

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

    await clickCell(a)
    await clickCell(b)
    await expect(debug).toHaveAttribute('data-revealed', '2')
    await clickCell(c)
    await expect(debug).toHaveAttribute('data-revealed', '1')
  })

  test('wait path: mismatch still resolves to concealed after timer', async ({
    page,
  }) => {
    await page.goto('/game?difficulty=easy&seed=e2e-memo-win')
    const meta = page.getByTestId('game-grid-meta')
    const cols = Number(await meta.getAttribute('data-cols'))
    const rows = Number(await meta.getAttribute('data-rows'))
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
      .toBe('0')
  })
})
