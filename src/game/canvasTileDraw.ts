import type { CellRect } from '@/game/cellRect'
import { easeOutCubic } from '@/game/animationEasing'
import { faceGradientStopsForEntry } from '@/game/tileFaceStyle'
import type { TileRuntimeState } from '@/game/memoryTypes'

export type TilePhase = TileRuntimeState['phase']

export interface TileDrawParams {
  phase: TilePhase
  img: HTMLImageElement | undefined
  catalogColor: string
  rarity: string
  parallax: { ox: number; oy: number }
  reducedMotion: boolean
  /** 0 = back at start of flip, 1 = face fully shown */
  reveal01: number
  /** 0 = opaque matched tile, 1 = fully faded (caller may skip draw) */
  matchFade01: number
  shakePx: number
  /** Face → concealed during mismatch flip-back (0..1); omit during shake. */
  mismatchConceal01?: number
  /** Dev: draw face even for concealed/matched */
  forceShowFace: boolean
  /** Normalized 0..1 highlight center on face inner rect; omit or null for no extra glow */
  faceHighlight?: { nx: number; ny: number } | null
}

const PAD = 3

function drawConcealedBack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const grd = ctx.createLinearGradient(x, y, x + w, y + h)
  grd.addColorStop(0, '#1e293b')
  grd.addColorStop(1, '#0f172a')
  ctx.fillStyle = grd
  ctx.fillRect(x, y, w, h)
  /* Neutral frame only — must not use catalog / rarity color (FR-001). */
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
}

/**
 * One cohesive face: gradient + contained image + glass in the same inner rect (FR-005, FR-006).
 */
function drawFaceContent(
  ctx: CanvasRenderingContext2D,
  rect: CellRect,
  img: HTMLImageElement | undefined,
  catalogColor: string,
  rarity: string,
  ox: number,
  oy: number,
  faceHighlight: { nx: number; ny: number } | null,
  reducedMotion: boolean,
): void {
  const { x, y, w, h } = rect
  const innerW = w - PAD * 2
  const innerH = h - PAD * 2
  const ix = x + PAD
  const iy = y + PAD

  const { start, end } = faceGradientStopsForEntry(catalogColor, rarity)
  const bg = ctx.createLinearGradient(ix, iy, ix + innerW, iy + innerH)
  bg.addColorStop(0, start)
  bg.addColorStop(1, end)
  ctx.fillStyle = bg
  ctx.fillRect(ix, iy, innerW, innerH)

  if (faceHighlight && !reducedMotion) {
    const hx = ix + faceHighlight.nx * innerW
    const hy = iy + faceHighlight.ny * innerH
    const rad = Math.max(innerW, innerH) * 0.95
    const rg = ctx.createRadialGradient(hx, hy, 0, hx, hy, rad)
    rg.addColorStop(0, 'rgba(255,255,255,0.32)')
    rg.addColorStop(0.35, 'rgba(255,255,255,0.1)')
    rg.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = rg
    ctx.fillRect(ix, iy, innerW, innerH)
  }

  ctx.save()
  ctx.beginPath()
  ctx.rect(ix, iy, innerW, innerH)
  ctx.clip()

  if (img?.complete && img.naturalWidth > 0) {
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const scale = Math.min(innerW / iw, innerH / ih)
    const dw = iw * scale
    const dh = ih * scale
    const dx = ix + (innerW - dw) / 2 + ox
    const dy = iy + (innerH - dh) / 2 + oy
    ctx.drawImage(img, dx, dy, dw, dh)
  } else {
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)'
    ctx.fillRect(ix, iy, innerW, innerH)
  }

  const glass = ctx.createLinearGradient(ix, iy, ix + innerW, iy + innerH)
  glass.addColorStop(0, 'rgba(255,255,255,0.22)')
  glass.addColorStop(0.45, 'rgba(255,255,255,0.04)')
  glass.addColorStop(1, 'rgba(15,23,42,0.12)')
  ctx.fillStyle = glass
  ctx.fillRect(ix, iy, innerW, innerH)

  ctx.restore()
}

/**
 * Draw one tile: concealed back, revealed face (parallax, rarity gradient), matched fade.
 */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  rect: CellRect,
  params: TileDrawParams,
): void {
  const { x, y, w, h } = rect
  const {
    phase,
    img,
    catalogColor,
    rarity,
    parallax,
    reducedMotion,
    reveal01,
    matchFade01,
    shakePx,
    mismatchConceal01,
    forceShowFace,
    faceHighlight = null,
  } = params

  if (phase === 'matched' && matchFade01 >= 1) {
    return
  }

  const ox = reducedMotion ? 0 : parallax.ox
  const oy = reducedMotion ? 0 : parallax.oy

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  const innerX = x + PAD
  const innerY = y + PAD
  const innerW = w - PAD * 2
  const innerH = h - PAD * 2
  const cx = x + w / 2
  const cy = y + h / 2

  if (shakePx !== 0) {
    ctx.translate(shakePx, 0)
  }

  let alpha = 1
  if (phase === 'matched') {
    alpha = 1 - easeOutCubic(matchFade01)
  }
  ctx.globalAlpha = alpha

  if (
    phase === 'revealed' &&
    mismatchConceal01 !== undefined &&
    !forceShowFace
  ) {
    const flipP = 1 - easeOutCubic(mismatchConceal01)
    const scaleX = Math.abs(Math.cos(Math.PI * (1 - flipP)))
    ctx.translate(cx, cy)
    ctx.scale(Math.max(0.08, scaleX), 1)
    ctx.translate(-cx, -cy)
    if (flipP > 0.5) {
      drawFaceContent(
        ctx,
        rect,
        img,
        catalogColor,
        rarity,
        ox,
        oy,
        faceHighlight,
        reducedMotion,
      )
    } else {
      drawConcealedBack(ctx, innerX, innerY, innerW, innerH)
    }
    ctx.restore()
    return
  }

  const showFace =
    forceShowFace ||
    phase === 'revealed' ||
    (phase === 'matched' && matchFade01 < 1)

  if (phase === 'concealed' && !forceShowFace) {
    drawConcealedBack(ctx, innerX, innerY, innerW, innerH)
    ctx.restore()
    return
  }

  if (!showFace) {
    ctx.restore()
    return
  }

  const p = forceShowFace ? 1 : easeOutCubic(reveal01)
  const scaleX = Math.abs(Math.cos(Math.PI * (1 - p)))

  ctx.translate(cx, cy)
  ctx.scale(Math.max(0.08, scaleX), 1)
  ctx.translate(-cx, -cy)

  if (p < 0.5 && !forceShowFace) {
    drawConcealedBack(ctx, innerX, innerY, innerW, innerH)
  } else {
    drawFaceContent(
      ctx,
      rect,
      img,
      catalogColor,
      rarity,
      ox,
      oy,
      faceHighlight,
      reducedMotion,
    )
  }

  ctx.restore()
}
