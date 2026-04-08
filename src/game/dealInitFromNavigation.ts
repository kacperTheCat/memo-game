import type { Difficulty } from '@/game/tileLibraryTypes'
import { createSeededRngForDeal } from '@/game/seedDeal'

export type MemoDealInitPayload = { seedNine: string | null }

/**
 * Read `memoDealInit.seedNine` from History API state (Vue Router push state).
 */
export function readMemoDealInitSeedNine(historyState: unknown): string | null {
  if (!historyState || typeof historyState !== 'object') {
    return null
  }
  const rec = historyState as Record<string, unknown>
  const m = rec.memoDealInit
  if (!m || typeof m !== 'object') {
    return null
  }
  const inner = m as Record<string, unknown>
  if (!('seedNine' in inner)) {
    return null
  }
  const s = inner.seedNine
  if (s === null) {
    return null
  }
  if (typeof s === 'string' && /^\d{9}$/.test(s)) {
    return s
  }
  return null
}

export function historyStateWithoutMemoDeal(
  state: unknown,
): Record<string, unknown> {
  if (!state || typeof state !== 'object') {
    return {}
  }
  const next = { ...(state as Record<string, unknown>) }
  delete next.memoDealInit
  return next
}

/**
 * Resolves RNG and deal kind for a **new** shuffle from Briefcase navigation.
 * Snapshot restore must use **`snapshot-restore`** so `memoDealInit` is ignored even if present.
 */
export function resolveRngAndDealKindForNewShuffle(
  difficulty: Difficulty,
  historyState: unknown,
  context: 'briefcase-navigation' | 'snapshot-restore',
): { rng: () => number; dealKind: 'seeded' | 'random' } {
  if (context === 'snapshot-restore') {
    return { rng: Math.random, dealKind: 'random' }
  }
  const nine = readMemoDealInitSeedNine(historyState)
  if (nine !== null) {
    return {
      rng: createSeededRngForDeal(nine, difficulty),
      dealKind: 'seeded',
    }
  }
  return { rng: Math.random, dealKind: 'random' }
}
