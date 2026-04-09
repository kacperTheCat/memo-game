import type { Difficulty } from '@/game/library/tileLibraryTypes'

export function formatActivePlayMsAsMmSs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Local calendar date from ISO timestamp (YYYY-MM-DD). */
export function formatCompletedAtDateLocalYyyyMmDd(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return '1970-01-01'
  }
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export function difficultyDisplayLabel(d: Difficulty): string {
  return difficultyLabels[d]
}
