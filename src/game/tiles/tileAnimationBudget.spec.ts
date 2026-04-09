import { describe, expect, it } from 'vitest'
import {
  MISMATCH_RESOLVE_MS,
  TILE_COLLECT_MS,
  TILE_FLIP_MS,
  TILE_MISMATCH_FLIP_BACK_MS,
} from '@/game/tiles/tileMotionConstants'

describe('tileAnimationBudget', () => {
  it('keeps motion segments within spec window (<= 2s)', () => {
    expect(TILE_FLIP_MS).toBeLessThanOrEqual(2000)
    expect(TILE_COLLECT_MS).toBeLessThanOrEqual(2000)
    expect(MISMATCH_RESOLVE_MS).toBeLessThanOrEqual(2000)
  })

  it('mismatch resolve covers flip-back duration', () => {
    expect(MISMATCH_RESOLVE_MS).toBeGreaterThanOrEqual(TILE_MISMATCH_FLIP_BACK_MS)
  })
})
