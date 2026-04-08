import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialState } from '@/game/memoryEngine'
import {
  STORAGE_COMPLETED_SESSIONS_KEY,
  STORAGE_IN_PROGRESS_KEY,
} from '@/game/sessionConstants'
import { useGameSessionStore } from '@/stores/gameSession'

describe('gameSession store', () => {
  const backing = new Map<string, string>()

  beforeEach(() => {
    backing.clear()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => (backing.has(k) ? backing.get(k)! : null),
      setItem: (k: string, v: string) => void backing.set(k, v),
      removeItem: (k: string) => void backing.delete(k),
    })
    setActivePinia(createPinia())
  })

  it('accumulates activePlayMs while in progress', () => {
    const s = useGameSessionStore()
    s.beginSession('easy')
    s.addActiveMs(100)
    expect(s.gameSession?.activePlayMs).toBe(100)
  })

  it('persists clickCount in snapshot and passes repeated restore trials', () => {
    const s = useGameSessionStore()
    s.beginSession('medium')
    s.incrementClick()
    s.incrementClick()
    const mem = createInitialState([0, 0, 1, 1])
    let ok = 0
    for (let i = 0; i < 20; i++) {
      s.flushSave(mem)
      const snap = s.loadInProgressSnapshot()
      if (snap?.session.clickCount === 2 && snap.cells.length === 4) {
        ok++
      }
    }
    expect(ok).toBeGreaterThanOrEqual(19)
  })

  it('abandon finalizes record and clears in-progress key', () => {
    const s = useGameSessionStore()
    s.beginSession('easy')
    s.incrementClick()
    s.flushSave(createInitialState([0, 1, 0, 1]))
    expect(backing.has(STORAGE_IN_PROGRESS_KEY)).toBe(true)
    s.finalizeSession('abandoned')
    expect(backing.has(STORAGE_IN_PROGRESS_KEY)).toBe(false)
    const raw = backing.get(STORAGE_COMPLETED_SESSIONS_KEY)
    expect(raw).toBeTruthy()
    const list = JSON.parse(raw!) as { outcome: string }[]
    expect(list[list.length - 1]?.outcome).toBe('abandoned')
  })

  it('caps completed history length', () => {
    const s = useGameSessionStore()
    for (let i = 0; i < 250; i++) {
      s.beginSession('easy')
      s.finalizeSession('won')
    }
    const raw = backing.get(STORAGE_COMPLETED_SESSIONS_KEY)
    const list = JSON.parse(raw || '[]') as unknown[]
    expect(list.length).toBeLessThanOrEqual(200)
  })
})
