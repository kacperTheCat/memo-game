import type { CompletedSessionRecord } from '@/game/memory/memoryTypes'
import { filterWonSessionsNewestFirst } from '@/game/win/winDebriefHistory'
import { describe, expect, it } from 'vitest'

function row(
  partial: Partial<CompletedSessionRecord> & Pick<CompletedSessionRecord, 'sessionId'>,
): CompletedSessionRecord {
  return {
    difficulty: 'easy',
    clickCount: 1,
    activePlayMs: 1000,
    completedAt: '2020-01-01T00:00:00.000Z',
    outcome: 'won',
    ...partial,
  }
}

describe('filterWonSessionsNewestFirst', () => {
  it('drops abandoned', () => {
    const out = filterWonSessionsNewestFirst([
      row({ sessionId: '1', outcome: 'abandoned' }),
      row({ sessionId: '2', outcome: 'won' }),
    ])
    expect(out).toHaveLength(1)
    expect(out[0]!.sessionId).toBe('2')
  })

  it('sorts newest first', () => {
    const out = filterWonSessionsNewestFirst([
      row({ sessionId: 'old', completedAt: '2020-01-01T00:00:00.000Z' }),
      row({ sessionId: 'new', completedAt: '2025-01-02T00:00:00.000Z' }),
      row({ sessionId: 'mid', completedAt: '2023-06-01T00:00:00.000Z' }),
    ])
    expect(out.map((r) => r.sessionId)).toEqual(['new', 'mid', 'old'])
  })
})
