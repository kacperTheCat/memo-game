import type { BuiltGrid } from '@/game/canvas/buildGridLayout'
import { resolveRngAndDealKindForNewShuffle } from '@/game/seed/dealInitFromNavigation'
import type { Difficulty } from '@/game/library/tileLibraryTypes'
import type { DealInitKind } from '@/stores/game/gamePlay'

export type StartNewRoundFromNavFn = (
  grid: BuiltGrid,
  rng: () => number,
  opts?: { dealInitKind?: DealInitKind },
) => void

/**
 * Resolve RNG from navigation/history and start a new round (Briefcase unlock path).
 */
export function startNewRoundFromBriefcaseNavigation(
  layout: BuiltGrid,
  difficulty: Difficulty,
  historyState: unknown,
  takeDealRng: () => () => number,
  startNewRound: StartNewRoundFromNavFn,
): void {
  const memo = resolveRngAndDealKindForNewShuffle(
    difficulty,
    historyState,
    'briefcase-navigation',
  )
  let rng = memo.rng
  let dealKind = memo.dealKind
  if (memo.dealKind === 'random') {
    rng = takeDealRng()
    dealKind = rng === Math.random ? 'random' : 'seeded'
  }
  startNewRound(layout, rng, { dealInitKind: dealKind })
}
