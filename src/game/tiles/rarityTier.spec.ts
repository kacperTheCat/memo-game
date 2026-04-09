import { describe, expect, it } from 'vitest'
import { isTopTier, rarityTierIndex, RARITY_ORDER } from '@/game/tiles/rarityTier'

describe('rarityTier', () => {
  it('orders known tiers low to high', () => {
    expect(rarityTierIndex('Consumer Grade')).toBe(0)
    expect(rarityTierIndex('Covert')).toBe(RARITY_ORDER.length - 1)
  })

  it('treats Covert as top tier', () => {
    expect(isTopTier('Covert')).toBe(true)
    expect(isTopTier('Classified')).toBe(false)
  })

  it('returns -1 for unknown rarity', () => {
    expect(rarityTierIndex('Unknown')).toBe(-1)
    expect(isTopTier('Unknown')).toBe(false)
  })
})
