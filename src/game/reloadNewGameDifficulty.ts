import type { Difficulty } from '@/game/tileLibraryTypes'

/** Survives full reload; consumed when starting the Play Again–equivalent game (FR-013). */
export const SESSION_STORAGE_RELOAD_NEW_GAME_DIFFICULTY_KEY =
  'memo-game.v1.reloadNewGameDifficulty'

function isDifficulty(x: string): x is Difficulty {
  return x === 'easy' || x === 'medium' || x === 'hard'
}

export function peekReloadNewGameDifficulty(): Difficulty | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_RELOAD_NEW_GAME_DIFFICULTY_KEY)
    if (!raw || !isDifficulty(raw)) {
      return null
    }
    return raw
  } catch {
    return null
  }
}

/** Read and remove; use once when hydrating `/game` after reload-on-debrief. */
export function consumeReloadNewGameDifficulty(): Difficulty | null {
  const d = peekReloadNewGameDifficulty()
  if (d) {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_RELOAD_NEW_GAME_DIFFICULTY_KEY)
    } catch {
      /* ignore */
    }
  }
  return d
}

export function setReloadNewGameDifficulty(d: Difficulty): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_RELOAD_NEW_GAME_DIFFICULTY_KEY, d)
  } catch {
    /* ignore */
  }
}

export function clearReloadNewGameDifficulty(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_RELOAD_NEW_GAME_DIFFICULTY_KEY)
  } catch {
    /* ignore */
  }
}
