import type { TileRuntimeState } from '@/game/memoryTypes'
import type { CellRect } from '@/game/cellRect'
import { parallaxOffset } from '@/game/tileParallax'

export type TilePhase = TileRuntimeState['phase']

/**
 * Draw one tile: concealed back, revealed face (with optional parallax), or skip if matched.
 */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  rect: CellRect,
  phase: TilePhase,
  img: HTMLImageElement | undefined,
  borderColor: string,
  pointerCss: { x: number; y: number } | null,
  reducedMotion: boolean,
): void {
  const pad = 2
  const { x, y, w, h } = rect
  if (phase === 'matched') {
    return
  }

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  if (phase === 'concealed') {
    const grd = ctx.createLinearGradient(x, y, x + w, y + h)
    grd.addColorStop(0, '#1e293b')
    grd.addColorStop(1, '#0f172a')
    ctx.fillStyle = grd
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 2
    ctx.fillRect(x + pad, y + pad, w - pad * 2, h - pad * 2)
    ctx.strokeRect(x + pad, y + pad, w - pad * 2, h - pad * 2)
    ctx.restore()
    return
  }

  let ox = 0
  let oy = 0
  if (pointerCss && !reducedMotion) {
    const cx = x + w / 2
    const cy = y + h / 2
    const p = parallaxOffset(pointerCss.x, pointerCss.y, cx, cy)
    ox = p.ox
    oy = p.oy
  }

  if (img?.complete && img.naturalWidth > 0) {
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const innerW = w - pad * 2
    const innerH = h - pad * 2
    const scale = Math.max(innerW / iw, innerH / ih)
    const dw = iw * scale
    const dh = ih * scale
    const dx = x + pad + (innerW - dw) / 2 + ox
    const dy = y + pad + (innerH - dh) / 2 + oy
    ctx.drawImage(img, dx, dy, dw, dh)
  } else {
    ctx.fillStyle = '#334155'
    ctx.fillRect(x + pad, y + pad, w - pad * 2, h - pad * 2)
  }
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1
  ctx.strokeRect(x + pad, y + pad, w - pad * 2, h - pad * 2)
  ctx.restore()
}
