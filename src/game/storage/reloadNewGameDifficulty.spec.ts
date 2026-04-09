import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearReloadNewGameDifficulty,
  consumeReloadNewGameDifficulty,
  peekReloadNewGameDifficulty,
  SESSION_STORAGE_RELOAD_NEW_GAME_DIFFICULTY_KEY,
  setReloadNewGameDifficulty,
} from '@/game/storage/reloadNewGameDifficulty'

describe('reloadNewGameDifficulty', () => {
  const backing = new Map<string, string>()

  beforeEach(() => {
    backing.clear()
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => (backing.has(k) ? backing.get(k)! : null),
      setItem: (k: string, v: string) => void backing.set(k, v),
      removeItem: (k: string) => void backing.delete(k),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('set then consume returns difficulty and clears key', () => {
    setReloadNewGameDifficulty('hard')
    expect(peekReloadNewGameDifficulty()).toBe('hard')
    expect(consumeReloadNewGameDifficulty()).toBe('hard')
    expect(backing.has(SESSION_STORAGE_RELOAD_NEW_GAME_DIFFICULTY_KEY)).toBe(false)
    expect(consumeReloadNewGameDifficulty()).toBeNull()
  })

  it('clearReloadNewGameDifficulty removes key', () => {
    setReloadNewGameDifficulty('easy')
    clearReloadNewGameDifficulty()
    expect(peekReloadNewGameDifficulty()).toBeNull()
  })
})
