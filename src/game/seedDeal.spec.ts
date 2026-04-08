import { describe, expect, it } from 'vitest'
import rawLibrary from '@/data/tile-library.json'
import { buildGridCells } from '@/game/buildGridLayout'
import { shuffleIdentities } from '@/game/memoryEngine'
import type { TileLibraryFile } from '@/game/tileLibraryTypes'
import {
  countBriefcaseSeedDigits,
  createSeededRngForDeal,
  dealKey,
  hashSeedKey,
  isBriefcaseSeedIncompleteEntry,
  mulberry32,
  parseNineDigitSeedOrNull,
  rngForDealInit,
} from '@/game/seedDeal'

const lib = rawLibrary as TileLibraryFile

function identityOrderAfterDeal(
  difficulty: 'easy' | 'medium' | 'hard',
  nineDigits: string,
): number[] {
  const grid = buildGridCells(lib.entries, difficulty)
  const rng = rngForDealInit(difficulty, nineDigits)
  return shuffleIdentities(
    grid.cells.map((c) => c.identityIndex),
    rng,
  )
}

describe('seedDeal', () => {
  it('countBriefcaseSeedDigits and isBriefcaseSeedIncompleteEntry', () => {
    expect(countBriefcaseSeedDigits('')).toBe(0)
    expect(isBriefcaseSeedIncompleteEntry('')).toBe(false)
    expect(countBriefcaseSeedDigits('1')).toBe(1)
    expect(isBriefcaseSeedIncompleteEntry('1')).toBe(true)
    expect(isBriefcaseSeedIncompleteEntry('123-456-78')).toBe(true)
    expect(isBriefcaseSeedIncompleteEntry('123-456-789')).toBe(false)
    expect(countBriefcaseSeedDigits('123-456-789')).toBe(9)
  })

  it('hashSeedKey is stable for deal keys', () => {
    expect(hashSeedKey(dealKey('000000000', 'easy'))).toBe(2394223321)
    expect(hashSeedKey(dealKey('000000000', 'medium'))).not.toBe(
      hashSeedKey(dealKey('000000000', 'easy')),
    )
  })

  it('mulberry32 sequence is stable for a fixed seed', () => {
    const rng = mulberry32(0x12345678)
    expect(rng()).toBeCloseTo(0.10615200875326991, 10)
    expect(rng()).toBeCloseTo(0.941276284167543, 10)
    expect(rng()).toBeCloseTo(0.9398706152569503, 10)
  })

  it('createSeededRngForDeal is deterministic', () => {
    const a = createSeededRngForDeal('123456789', 'medium')
    const b = createSeededRngForDeal('123456789', 'medium')
    expect(a()).toBe(b())
  })

  it('golden shuffled identity rows (FR-003 cross-client parity)', () => {
    expect(identityOrderAfterDeal('easy', '000000000')).toEqual([
      6, 3, 4, 3, 7, 7, 5, 6, 0, 1, 0, 5, 1, 2, 2, 4,
    ])
    expect(identityOrderAfterDeal('medium', '123456789')).toEqual([
      10, 12, 11, 16, 7, 9, 4, 17, 1, 13, 12, 14, 14, 16, 8, 0, 15, 3, 11, 2,
      15, 13, 5, 17, 9, 8, 2, 7, 6, 3, 4, 0, 10, 6, 1, 5,
    ])
    expect(identityOrderAfterDeal('hard', '001002003')).toEqual([
      4, 22, 7, 26, 8, 30, 11, 22, 23, 8, 27, 1, 2, 10, 6, 19, 10, 16, 1, 6,
      11, 3, 28, 0, 29, 0, 14, 25, 12, 4, 25, 31, 23, 30, 13, 14, 20, 9, 29, 9,
      18, 15, 17, 24, 15, 21, 2, 16, 31, 17, 20, 21, 26, 5, 13, 18, 19, 3, 12,
      28, 24, 5, 27, 7,
    ])
  })

  describe('parseNineDigitSeedOrNull', () => {
    it('returns null for empty, partial, or invalid', () => {
      expect(parseNineDigitSeedOrNull('')).toBe(null)
      expect(parseNineDigitSeedOrNull('12345')).toBe(null)
      expect(parseNineDigitSeedOrNull('12345678')).toBe(null)
    })

    it('accepts masked and plain nine-digit strings', () => {
      expect(parseNineDigitSeedOrNull('123-456-789')).toBe('123456789')
      expect(parseNineDigitSeedOrNull('123456789')).toBe('123456789')
      expect(parseNineDigitSeedOrNull('001-002-003')).toBe('001002003')
    })

    it('strips non-digits and requires exactly nine digits', () => {
      expect(parseNineDigitSeedOrNull('12a34b56c78d9')).toBe('123456789')
      expect(parseNineDigitSeedOrNull('1234567890')).toBe(null)
    })
  })
})
