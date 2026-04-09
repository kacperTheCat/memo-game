import {
  difficultyDisplayLabel,
  formatActivePlayMsAsMmSs,
  formatCompletedAtDateLocalYyyyMmDd,
} from '@/game/win/winDebriefFormat'
import { describe, expect, it } from 'vitest'

describe('winDebriefFormat', () => {
  it('formatActivePlayMsAsMmSs', () => {
    expect(formatActivePlayMsAsMmSs(0)).toBe('00:00')
    expect(formatActivePlayMsAsMmSs(59_000)).toBe('00:59')
    expect(formatActivePlayMsAsMmSs(60_000)).toBe('01:00')
    expect(formatActivePlayMsAsMmSs(165_000)).toBe('02:45')
  })

  it('formatCompletedAtDateLocalYyyyMmDd uses local date', () => {
    expect(formatCompletedAtDateLocalYyyyMmDd('2023-10-26T12:00:00.000Z')).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    )
  })

  it('difficultyDisplayLabel', () => {
    expect(difficultyDisplayLabel('easy')).toBe('Easy')
    expect(difficultyDisplayLabel('medium')).toBe('Medium')
    expect(difficultyDisplayLabel('hard')).toBe('Hard')
  })
})
