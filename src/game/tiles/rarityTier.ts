/**
 * CS-style skin rarity ladder (low → high). Unknown strings sort below known.
 */
export const RARITY_ORDER: readonly string[] = [
  'Consumer Grade',
  'Industrial Grade',
  'Mil-Spec Grade',
  'Restricted',
  'Classified',
  'Covert',
] as const

export function rarityTierIndex(rarity: string): number {
  const i = RARITY_ORDER.indexOf(rarity.trim())
  return i === -1 ? -1 : i
}

export function isTopTier(rarity: string): boolean {
  const top = RARITY_ORDER[RARITY_ORDER.length - 1]
  return rarity.trim() === top
}
