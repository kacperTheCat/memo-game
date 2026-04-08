import type { Difficulty } from '@/game/tileLibraryTypes'

/** FNV-1a 32-bit over UTF-16 code units (deterministic across ES engines). */
export function hashSeedKey(key: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Mulberry32 PRNG; returns uniform [0, 1). */
export function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function dealKey(nineDigits: string, difficulty: Difficulty): string {
  return `${nineDigits}:${difficulty}`
}

export function createSeededRngForDeal(
  nineDigits: string,
  difficulty: Difficulty,
): () => number {
  return mulberry32(hashSeedKey(dealKey(nineDigits, difficulty)))
}

/** Count of decimal digits in the Briefcase seed field (ignores mask hyphens). */
export function countBriefcaseSeedDigits(raw: string): number {
  return raw.replace(/\D/g, '').length
}

/**
 * True when the user started entering a seed but did not finish all nine digits.
 * Empty field is allowed (optional seed); complete nine digits is allowed.
 */
export function isBriefcaseSeedIncompleteEntry(raw: string): boolean {
  const n = countBriefcaseSeedDigits(raw)
  return n >= 1 && n < 9
}

export function parseNineDigitSeedOrNull(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 9) {
    return null
  }
  return /^\d{9}$/.test(digits) ? digits : null
}

export function rngForDealInit(
  difficulty: Difficulty,
  seedNine: string | null,
): () => number {
  if (seedNine !== null && /^\d{9}$/.test(seedNine)) {
    return createSeededRngForDeal(seedNine, difficulty)
  }
  return Math.random
}
