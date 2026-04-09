import type { CompletedSessionRecord } from '@/game/memory/memoryTypes'

export function filterWonSessionsNewestFirst(
  rows: CompletedSessionRecord[],
): CompletedSessionRecord[] {
  return rows
    .filter((r) => r.outcome === 'won')
    .slice()
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : a.completedAt > b.completedAt ? -1 : 0))
}
