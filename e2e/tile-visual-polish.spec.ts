import { expect, test } from '@playwright/test'

import {
  BOARD_CANVAS_INSET_PX,
  BOARD_GAP_PX,
  boardStripLayout,
} from '../src/game/canvasLayout'

test.describe('008 tile visual polish', () => {
  test('US1: new game starts with all tiles concealed (no pre-reveal)', async ({
    page,
  }) => {
    await page.goto('/game')
    await expect(page.getByTestId('game-memory-debug')).toHaveAttribute(
      'data-revealed',
      '0',
    )
    await expect(page.getByTestId('game-memory-debug')).toHaveAttribute(
      'data-matched',
      '0',
    )
  })

  test('US2: first pick reveals exactly one tile', async ({ page }) => {
    await page.goto('/game')
    const meta = page.getByTestId('game-grid-meta')
    const rows = Number(await meta.getAttribute('data-rows'))
    const cols = Number(await meta.getAttribute('data-cols'))
    const canvas = page.getByTestId('game-canvas')
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    const { boardH } = boardStripLayout(box!.width, box!.height)
    const iw = box!.width - 2 * BOARD_CANVAS_INSET_PX
    const ih = boardH - 2 * BOARD_CANVAS_INSET_PX
    const cellW = (iw - BOARD_GAP_PX * (cols - 1)) / cols
    const cellH = (ih - BOARD_GAP_PX * (rows - 1)) / rows
    await canvas.click({
      position: {
        x: BOARD_CANVAS_INSET_PX + cellW * 0.5,
        y: BOARD_CANVAS_INSET_PX + cellH * 0.5,
      },
    })
    await expect
      .poll(async () =>
        page.getByTestId('game-memory-debug').getAttribute('data-revealed'),
      )
      .toBe('1')
  })

  test('US2: wrong pair returns to zero revealed after mismatch window', async ({
    page,
  }) => {
    await page.goto('/game')
    const meta = page.getByTestId('game-grid-meta')
    const rows = Number(await meta.getAttribute('data-rows'))
    const cols = Number(await meta.getAttribute('data-cols'))
    const canvas = page.getByTestId('game-canvas')
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    const { boardH } = boardStripLayout(box!.width, box!.height)
    const iw = box!.width - 2 * BOARD_CANVAS_INSET_PX
    const ih = boardH - 2 * BOARD_CANVAS_INSET_PX
    const cellW = (iw - BOARD_GAP_PX * (cols - 1)) / cols
    const cellH = (ih - BOARD_GAP_PX * (rows - 1)) / rows

    const identities = JSON.parse(
      (await page.getByTestId('game-initial-identities').getAttribute(
        'data-identities',
      )) || '[]',
    ) as number[]

    let a = -1
    let b = -1
    for (let i = 0; i < identities.length; i++) {
      for (let j = i + 1; j < identities.length; j++) {
        if (identities[i] !== identities[j]) {
          a = i
          b = j
          break
        }
      }
      if (a >= 0) {
        break
      }
    }
    expect(a).toBeGreaterThanOrEqual(0)
    expect(b).toBeGreaterThanOrEqual(0)

    const rc = (idx: number) => {
      const row = Math.floor(idx / cols)
      const col = idx % cols
      return {
        x:
          BOARD_CANVAS_INSET_PX +
          col * (cellW + BOARD_GAP_PX) +
          cellW * 0.5,
        y:
          BOARD_CANVAS_INSET_PX +
          row * (cellH + BOARD_GAP_PX) +
          cellH * 0.5,
      }
    }
    const pa = rc(a)
    const pb = rc(b)
    await canvas.click({ position: pa })
    await expect
      .poll(async () =>
        page.getByTestId('game-memory-debug').getAttribute('data-revealed'),
      )
      .toBe('1')
    await canvas.click({ position: pb })
    await expect
      .poll(async () =>
        page.getByTestId('game-memory-debug').getAttribute('data-revealed'),
      )
      .toBe('2')
    await expect
      .poll(async () =>
        page.getByTestId('game-memory-debug').getAttribute('data-revealed'),
      )
      .toBe('0', { timeout: 5000 })
  })

  test('US2: collect count increases after a correct pair', async ({
    page,
  }) => {
    await page.goto('/game')
    const meta = page.getByTestId('game-grid-meta')
    const rows = Number(await meta.getAttribute('data-rows'))
    const cols = Number(await meta.getAttribute('data-cols'))
    const canvas = page.getByTestId('game-canvas')
    const strip = page.getByTestId('game-collect-strip')
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    const { boardH } = boardStripLayout(box!.width, box!.height)
    const iw = box!.width - 2 * BOARD_CANVAS_INSET_PX
    const ih = boardH - 2 * BOARD_CANVAS_INSET_PX
    const cellW = (iw - BOARD_GAP_PX * (cols - 1)) / cols
    const cellH = (ih - BOARD_GAP_PX * (rows - 1)) / rows

    const identities = JSON.parse(
      (await page.getByTestId('game-initial-identities').getAttribute(
        'data-identities',
      )) || '[]',
    ) as number[]

    let a = -1
    let b = -1
    for (let i = 0; i < identities.length; i++) {
      for (let j = i + 1; j < identities.length; j++) {
        if (identities[i] === identities[j]) {
          a = i
          b = j
          break
        }
      }
      if (a >= 0) {
        break
      }
    }
    expect(a).toBeGreaterThanOrEqual(0)
    expect(b).toBeGreaterThanOrEqual(0)

    const rc = (idx: number) => {
      const row = Math.floor(idx / cols)
      const col = idx % cols
      return {
        x:
          BOARD_CANVAS_INSET_PX +
          col * (cellW + BOARD_GAP_PX) +
          cellW * 0.5,
        y:
          BOARD_CANVAS_INSET_PX +
          row * (cellH + BOARD_GAP_PX) +
          cellH * 0.5,
      }
    }
    await expect(strip).toHaveAttribute('data-collect-count', '0')
    await canvas.click({ position: rc(a) })
    await canvas.click({ position: rc(b) })
    await expect
      .poll(async () => strip.getAttribute('data-collect-count'))
      .toBe('1', { timeout: 8000 })
  })

  test('US2: mismatch phase shows shake then flip_back', async ({ page }) => {
    await page.goto('/game')
    const shell = page.getByTestId('game-canvas-shell')
    const meta = page.getByTestId('game-grid-meta')
    const rows = Number(await meta.getAttribute('data-rows'))
    const cols = Number(await meta.getAttribute('data-cols'))
    const canvas = page.getByTestId('game-canvas')
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    const { boardH } = boardStripLayout(box!.width, box!.height)
    const iw = box!.width - 2 * BOARD_CANVAS_INSET_PX
    const ih = boardH - 2 * BOARD_CANVAS_INSET_PX
    const cellW = (iw - BOARD_GAP_PX * (cols - 1)) / cols
    const cellH = (ih - BOARD_GAP_PX * (rows - 1)) / rows

    const identities = JSON.parse(
      (await page.getByTestId('game-initial-identities').getAttribute(
        'data-identities',
      )) || '[]',
    ) as number[]

    let a = -1
    let b = -1
    for (let i = 0; i < identities.length; i++) {
      for (let j = i + 1; j < identities.length; j++) {
        if (identities[i] !== identities[j]) {
          a = i
          b = j
          break
        }
      }
      if (a >= 0) {
        break
      }
    }
    expect(a).toBeGreaterThanOrEqual(0)

    const rc = (idx: number) => {
      const row = Math.floor(idx / cols)
      const col = idx % cols
      return {
        x:
          BOARD_CANVAS_INSET_PX +
          col * (cellW + BOARD_GAP_PX) +
          cellW * 0.5,
        y:
          BOARD_CANVAS_INSET_PX +
          row * (cellH + BOARD_GAP_PX) +
          cellH * 0.5,
      }
    }
    await canvas.click({ position: rc(a) })
    await canvas.click({ position: rc(b) })
    await expect
      .poll(async () => shell.getAttribute('data-mismatch-phase'))
      .toBe('shake', { timeout: 2000 })
    await expect
      .poll(async () => shell.getAttribute('data-mismatch-phase'))
      .toBe('flip_back', { timeout: 3000 })
  })

  test('US4: pointer move on shell keeps canvas responsive', async ({
    page,
  }) => {
    await page.goto('/game')
    const shell = page.getByTestId('game-canvas-shell')
    const box = await shell.boundingBox()
    expect(box).toBeTruthy()
    await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.2)
    await page.mouse.move(box!.x + box!.width * 0.8, box!.y + box!.height * 0.8)
    await expect(page.getByTestId('game-canvas')).toBeVisible()
  })
})
