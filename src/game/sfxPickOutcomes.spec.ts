import { describe, expect, it } from 'vitest'
import { createInitialState, pickCell } from '@/game/memoryEngine'
import {
  cloneMemoryStateShallow,
  sfxOutcomesForPick,
} from '@/game/sfxPickOutcomes'

describe('sfxPickOutcomes', () => {
  it('first reveal: flip only', () => {
    const before = createInitialState([0, 0, 1, 1])
    const { state: after } = pickCell(before, 0)
    expect(after).not.toBe(before)
    const o = sfxOutcomesForPick(before, after, 0)
    expect(o).toEqual({ flip: true, success: false })
  })

  it('second pick match: flip + success on second index', () => {
    const s0 = createInitialState([0, 0, 1, 1])
    const { state: s1 } = pickCell(s0, 0)
    const before = cloneMemoryStateShallow(s1)
    const { state: after } = pickCell(s1, 1)
    const o = sfxOutcomesForPick(before, after, 1)
    expect(o).toEqual({ flip: true, success: true })
  })

  it('second pick mismatch: flip only on second index', () => {
    const s0 = createInitialState([0, 0, 1, 1])
    const { state: s1 } = pickCell(s0, 0)
    const before = cloneMemoryStateShallow(s1)
    const { state: after } = pickCell(s1, 2)
    const o = sfxOutcomesForPick(before, after, 2)
    expect(o).toEqual({ flip: true, success: false })
  })
})
