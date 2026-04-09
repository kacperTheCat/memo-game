import { describe, expect, it } from 'vitest'
import {
  clearMismatch,
  createInitialState,
  isWin,
  isWrongPairPending,
  normalizePairForHydration,
  pickCell,
} from '@/game/memory/memoryEngine'

describe('memoryEngine', () => {
  it('reveals first concealed pick', () => {
    const s0 = createInitialState([0, 0, 1, 1])
    const { state, accepted } = pickCell(s0, 0)
    expect(accepted).toBe(true)
    expect(state.cells[0]?.phase).toBe('revealed')
    expect(state.pair.firstIndex).toBe(0)
  })

  it('ignores pick on matched cell', () => {
    let s = createInitialState([0, 0, 1, 1])
    s = pickCell(s, 0).state
    s = pickCell(s, 1).state
    const { state, accepted } = pickCell(s, 0)
    expect(accepted).toBe(false)
    expect(state.cells[0]?.phase).toBe('matched')
  })

  it('ignores second pick on same revealed tile (no double-count scenario)', () => {
    const s0 = createInitialState([0, 1, 0, 1])
    const s1 = pickCell(s0, 0).state
    expect(s1.cells[0]?.phase).toBe('revealed')
    const { accepted } = pickCell(s1, 0)
    expect(accepted).toBe(false)
  })

  it('matches pair and clears selection', () => {
    let s = createInitialState([0, 0, 1, 1])
    s = pickCell(s, 0).state
    const r = pickCell(s, 1)
    expect(r.accepted).toBe(true)
    expect(r.state.cells[0]?.phase).toBe('matched')
    expect(r.state.cells[1]?.phase).toBe('matched')
    expect(r.state.pair.firstIndex).toBeNull()
    expect(r.state.pair.locked).toBe(false)
  })

  it('mismatch leaves pair unlocked; third concealed pick interrupts and starts next turn', () => {
    let s = createInitialState([0, 1, 0, 1])
    s = pickCell(s, 0).state
    s = pickCell(s, 1).state
    expect(isWrongPairPending(s)).toBe(true)
    expect(s.pair.locked).toBe(false)
    expect(pickCell(s, 0).accepted).toBe(false)
    expect(pickCell(s, 1).accepted).toBe(false)
    const r = pickCell(s, 2)
    expect(r.accepted).toBe(true)
    expect(r.state.cells[0]?.phase).toBe('concealed')
    expect(r.state.cells[1]?.phase).toBe('concealed')
    expect(r.state.cells[2]?.phase).toBe('revealed')
    expect(r.state.pair.firstIndex).toBe(2)
    expect(r.state.pair.secondIndex).toBeNull()
    expect(isWrongPairPending(r.state)).toBe(false)
  })

  it('normalizePairForHydration clears legacy locked flag during wrong pair', () => {
    let s = createInitialState([0, 1, 0, 1])
    s = pickCell(s, 0).state
    s = pickCell(s, 1).state
    s = {
      ...s,
      pair: { ...s.pair, locked: true },
    }
    expect(s.pair.locked).toBe(true)
    const n = normalizePairForHydration(s)
    expect(n.pair.locked).toBe(false)
    expect(isWrongPairPending(n)).toBe(true)
  })

  it('clearMismatch still conceals wrong pair', () => {
    let s = createInitialState([0, 1, 0, 1])
    s = pickCell(s, 0).state
    s = pickCell(s, 1).state
    const cleared = clearMismatch(s)
    expect(cleared.cells[0]?.phase).toBe('concealed')
    expect(cleared.cells[1]?.phase).toBe('concealed')
    expect(cleared.pair.locked).toBe(false)
  })

  it('detects win when all matched', () => {
    let s = createInitialState([0, 0, 1, 1])
    s = pickCell(s, 0).state
    s = pickCell(s, 1).state
    s = pickCell(s, 2).state
    s = pickCell(s, 3).state
    expect(isWin(s)).toBe(true)
  })
})
