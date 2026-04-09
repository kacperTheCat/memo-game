import { isTopTier } from '@/game/rarityTier'

export interface Rgb {
  r: number
  g: number
  b: number
}

export function parseHexColor(hex: string): Rgb | null {
  const h = hex.trim()
  const m = /^#?([0-9a-fA-F]{6})$/.exec(h)
  if (!m?.[1]) {
    return null
  }
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToCss({ r, g, b }: Rgb): string {
  return `rgb(${r},${g},${b})`
}

export function darkenRgb(c: Rgb, factor: number): Rgb {
  const f = Math.max(0, Math.min(1, factor))
  return {
    r: Math.round(c.r * f),
    g: Math.round(c.g * f),
    b: Math.round(c.b * f),
  }
}

/** Gold-forward gradient stops for top rarity tier. */
export const GOLD_FACE_STOPS = {
  light: '#f6e6a8',
  mid: '#c9a227',
  dark: '#6b4c0a',
} as const

export function faceGradientStopsForEntry(
  catalogColor: string,
  rarity: string,
): { start: string; end: string } {
  if (isTopTier(rarity)) {
    return { start: GOLD_FACE_STOPS.light, end: GOLD_FACE_STOPS.dark }
  }
  const base = parseHexColor(catalogColor) ?? { r: 51, g: 65, b: 85 }
  const deep = darkenRgb(base, 0.45)
  return { start: rgbToCss(base), end: rgbToCss(deep) }
}
