import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { playSfx } from '@/audio/gameSfx'
import type { BuiltGrid } from '@/game/buildGridLayout'
import {
  clearMismatch,
  createInitialState,
  isWin,
  isWrongPairPending,
  normalizePairForHydration,
  pickCell,
  shuffleIdentities,
  type MemoryState,
} from '@/game/memoryEngine'
import { cloneMemoryStateShallow } from '@/game/sfxPickOutcomes'
import { gridDimensions } from '@/game/buildGridLayout'
import { MISMATCH_RESOLVE_MS } from '@/game/tileMotionConstants'

export { MISMATCH_RESOLVE_MS } from '@/game/tileMotionConstants'

export type DealInitKind = 'seeded' | 'random'

export const useGamePlayStore = defineStore('gamePlay', () => {
  const memory = shallowRef<MemoryState | null>(null)
  const rows = ref(4)
  const cols = ref(4)
  /** How the current board was shuffled (E2E / debug; snapshot hydrate = random). */
  const dealInitKind = ref<DealInitKind>('random')
  let mismatchTimer: ReturnType<typeof setTimeout> | null = null

  function clearMismatchTimer(): void {
    if (mismatchTimer !== null) {
      clearTimeout(mismatchTimer)
      mismatchTimer = null
    }
  }

  function armMismatchTimerIfNeeded(): void {
    const st = memory.value
    if (!st || !isWrongPairPending(st)) {
      return
    }
    mismatchTimer = setTimeout(() => {
      if (memory.value && isWrongPairPending(memory.value)) {
        memory.value = clearMismatch(memory.value)
        playSfx('fail')
      }
      mismatchTimer = null
    }, MISMATCH_RESOLVE_MS)
  }

  function startNewRound(
    grid: BuiltGrid,
    rng: () => number = Math.random,
    opts?: { dealInitKind?: DealInitKind },
  ): void {
    clearMismatchTimer()
    const ids = shuffleIdentities(
      grid.cells.map((c) => c.identityIndex),
      rng,
    )
    memory.value = createInitialState(ids)
    rows.value = grid.rows
    cols.value = grid.cols
    dealInitKind.value = opts?.dealInitKind ?? 'random'
  }

  function hydrateFromSnapshot(
    cells: MemoryState['cells'],
    pair: MemoryState['pair'],
    difficulty: import('@/game/tileLibraryTypes').Difficulty,
  ): void {
    clearMismatchTimer()
    const { rows: r, cols: c } = gridDimensions(difficulty)
    if (cells.length !== r * c) {
      memory.value = null
      return
    }
    const mem: MemoryState = {
      cells: cells.map((x) => ({ ...x })),
      pair: { ...pair },
    }
    memory.value = normalizePairForHydration(mem)
    rows.value = r
    cols.value = c
    dealInitKind.value = 'random'
    armMismatchTimerIfNeeded()
  }

  /**
   * @returns whether the pick was accepted (caller may increment clickCount).
   */
  function tryPick(index: number): { accepted: boolean; won: boolean } {
    if (!memory.value) {
      return { accepted: false, won: false }
    }
    const memBefore = cloneMemoryStateShallow(memory.value)
    const hadWrongPair = isWrongPairPending(memBefore)
    const result = pickCell(memory.value, index)
    if (!result.accepted) {
      return { accepted: false, won: false }
    }
    // Only clear after an accepted pick: clearing on every tryPick would cancel the
    // mismatch timer when the user taps a rejected cell.
    clearMismatchTimer()
    memory.value = result.state

    if (
      hadWrongPair &&
      memory.value &&
      !isWrongPairPending(memory.value)
    ) {
      playSfx('fail')
    }

    armMismatchTimerIfNeeded()

    const won = isWin(memory.value)
    return { accepted: true, won }
  }

  function resetRound(): void {
    clearMismatchTimer()
    memory.value = null
  }

  return {
    memory,
    rows,
    cols,
    dealInitKind,
    startNewRound,
    hydrateFromSnapshot,
    tryPick,
    resetRound,
    clearMismatchTimer,
  }
})
