import { describe, expect, it } from 'vitest'
import { operationCompleteMaxDurationMs } from '@/game/animation/operationCompleteStagger'

describe('Operation Complete stagger timing', () => {
  it('full title finishes within 2s budget', () => {
    const text = 'Operation Complete'
    const maxMs = operationCompleteMaxDurationMs(text.length, 48, 420)
    expect(maxMs).toBeLessThanOrEqual(2000)
  })

  it('reduced motion uses zero stagger (no per-char delay)', () => {
    expect(operationCompleteMaxDurationMs(20, 0, 0)).toBe(0)
  })
})
