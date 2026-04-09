import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { playSfx } from '@/audio/gameSfx'
import type { BuiltGrid } from '@/game/buildGridLayout'
import {
  clearMismatch,
  createInitialState,
  isWin,
  pickCell,
  shuffleIdentities,
  type MemoryState,
} from '@/game/memoryEngine'
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
    memory.value = {
      cells: cells.map((x) => ({ ...x })),
      pair: { ...pair },
    }
    rows.value = r
    cols.value = c
    dealInitKind.value = 'random'
  }

  /**
   * @returns whether the pick was accepted (caller may increment clickCount).
   */
  function tryPick(index: number): { accepted: boolean; won: boolean } {
    if (!memory.value) {
      return { accepted: false, won: false }
    }
    const result = pickCell(memory.value, index)
    if (!result.accepted) {
      return { accepted: false, won: false }
    }
    // Only clear after an accepted pick: clearing on every tryPick would cancel the
    // mismatch flip-back when the user taps again while the pair is locked (FR-002).
    clearMismatchTimer()
    memory.value = result.state

    const st = memory.value
    if (st.pair.locked && st.pair.firstIndex !== null && st.pair.secondIndex !== null) {
      const a = st.cells[st.pair.firstIndex]
      const b = st.cells[st.pair.secondIndex]
      if (a && b && a.identityIndex !== b.identityIndex) {
        mismatchTimer = setTimeout(() => {
          if (memory.value) {
            memory.value = clearMismatch(memory.value)
            playSfx('fail')
          }
          mismatchTimer = null
        }, MISMATCH_RESOLVE_MS)
      }
    }

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
