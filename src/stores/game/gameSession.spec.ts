import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialState, type MemoryState } from '@/game/memory/memoryEngine'
import {
  STORAGE_COMPLETED_SESSIONS_KEY,
  STORAGE_IN_PROGRESS_KEY,
} from '@/game/storage/sessionConstants'
import { useGameSessionStore } from '@/stores/game/gameSession'

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
    expect(s.gameSession?.dealBriefcaseSeedRaw).toBe('')
  })

  it('beginSession stores dealBriefcaseSeedRaw when provided', () => {
    const s = useGameSessionStore()
    s.beginSession('medium', { dealBriefcaseSeedRaw: '123-456-789' })
    expect(s.gameSession?.dealBriefcaseSeedRaw).toBe('123-456-789')
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

  it('buildSnapshot strips ephemeral cell fields (flipProgress)', () => {
    const s = useGameSessionStore()
    s.beginSession('easy')
    const mem = createInitialState([0, 0, 1, 1]) as MemoryState
    mem.cells[0] = { ...mem.cells[0]!, flipProgress: 0.42 }
    const snap = s.buildSnapshot(mem)
    expect(snap).not.toBeNull()
    const keys = Object.keys(snap!.cells[0]!).sort()
    expect(keys).toEqual(['identityIndex', 'phase'])
  })

  it('clearSession drops in-memory session', () => {
    const s = useGameSessionStore()
    s.beginSession('easy')
    expect(s.gameSession).not.toBeNull()
    s.clearSession()
    expect(s.gameSession).toBeNull()
  })

  it('after won finalize, clearSession clears memory but keeps completed won row (FR-014 hub dismiss)', () => {
    const s = useGameSessionStore()
    s.beginSession('medium')
    s.finalizeSession('won')
    expect(s.gameSession?.status).toBe('won')
    const rawBefore = backing.get(STORAGE_COMPLETED_SESSIONS_KEY)
    expect(rawBefore).toBeTruthy()
    const lenBefore = (JSON.parse(rawBefore!) as unknown[]).length

    s.clearSession()
    expect(s.gameSession).toBeNull()

    const rawAfter = backing.get(STORAGE_COMPLETED_SESSIONS_KEY)
    expect(rawAfter).toBeTruthy()
    const list = JSON.parse(rawAfter!) as { outcome: string }[]
    expect(list.length).toBe(lenBefore)
    expect(list[list.length - 1]?.outcome).toBe('won')
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
