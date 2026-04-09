import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  readMemoDealInitSeedNine,
  resolveRngAndDealKindForNewShuffle,
} from '@/game/seed/dealInitFromNavigation'

describe('dealInitFromNavigation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('readMemoDealInitSeedNine parses valid payload', () => {
    expect(
      readMemoDealInitSeedNine({ memoDealInit: { seedNine: '123456789' } }),
    ).toBe('123456789')
    expect(readMemoDealInitSeedNine({ memoDealInit: { seedNine: null } })).toBe(
      null,
    )
    expect(readMemoDealInitSeedNine({})).toBe(null)
  })

  it('snapshot-restore context ignores memoDealInit and uses Math.random', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.42)
    const hist = { memoDealInit: { seedNine: '111111111' } }
    const { rng, dealKind } = resolveRngAndDealKindForNewShuffle(
      'easy',
      hist,
      'snapshot-restore',
    )
    expect(dealKind).toBe('random')
    expect(rng()).toBe(0.42)
    spy.mockRestore()
  })

  it('briefcase-navigation uses seeded rng when nine digits present', () => {
    const hist = { memoDealInit: { seedNine: '000000000' } }
    const { rng, dealKind } = resolveRngAndDealKindForNewShuffle(
      'easy',
      hist,
      'briefcase-navigation',
    )
    expect(dealKind).toBe('seeded')
    const a = rng()
    const b = rng()
    const rng2 = resolveRngAndDealKindForNewShuffle(
      'easy',
      hist,
      'briefcase-navigation',
    ).rng
    expect(rng2()).toBe(a)
    expect(rng2()).toBe(b)
  })
})
