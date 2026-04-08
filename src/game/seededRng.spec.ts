import { createSeededRandom, hashStringToUint32 } from '@/game/seededRng'
import { describe, expect, it } from 'vitest'

describe('seededRng', () => {
  it('hashStringToUint32 is stable', () => {
    expect(hashStringToUint32('e2e-memo-win')).toBe(hashStringToUint32('e2e-memo-win'))
    expect(hashStringToUint32('a')).not.toBe(hashStringToUint32('b'))
  })

  it('createSeededRandom is deterministic', () => {
    const a = createSeededRandom('same')
    const b = createSeededRandom('same')
    for (let i = 0; i < 20; i++) {
      expect(a()).toBe(b())
    }
  })

  it('createSeededRandom differs by seed', () => {
    const x = createSeededRandom('one')()
    const y = createSeededRandom('two')()
    expect(x).not.toBe(y)
  })

  it('values stay in [0, 1)', () => {
    const r = createSeededRandom('x')
    for (let i = 0; i < 100; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
