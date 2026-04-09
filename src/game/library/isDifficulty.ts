import type { Difficulty } from '@/game/library/tileLibraryTypes'

export function isDifficulty(x: unknown): x is Difficulty {
  return x === 'easy' || x === 'medium' || x === 'hard'
}
