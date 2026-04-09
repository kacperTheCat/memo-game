import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MemoryState } from '@/game/memoryEngine'
import type {
  CompletedSessionRecord,
  GameSession,
  SessionSnapshot,
  SnapshotTileCell,
} from '@/game/memoryTypes'
import type { Difficulty } from '@/game/tileLibraryTypes'
import {
  COMPLETED_SESSIONS_MAX,
  STORAGE_COMPLETED_SESSIONS_KEY,
  STORAGE_IN_PROGRESS_KEY,
} from '@/game/sessionConstants'

function safeParse<T>(raw: string | null): T | null {
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function readCompletedList(): CompletedSessionRecord[] {
  const list = safeParse<CompletedSessionRecord[]>(
    localStorage.getItem(STORAGE_COMPLETED_SESSIONS_KEY),
  )
  return Array.isArray(list) ? list : []
}

function writeCompletedList(rows: CompletedSessionRecord[]): void {
  localStorage.setItem(STORAGE_COMPLETED_SESSIONS_KEY, JSON.stringify(rows))
}

export const useGameSessionStore = defineStore('gameSession', () => {
  const gameSession = ref<GameSession | null>(null)
  const storageError = ref<string | null>(null)
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  function clearSaveTimer(): void {
    if (saveTimer !== null) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
  }

  function beginSession(
    difficulty: Difficulty,
    opts?: { dealBriefcaseSeedRaw?: string },
  ): void {
    gameSession.value = {
      sessionId: crypto.randomUUID(),
      difficulty,
      dealBriefcaseSeedRaw: opts?.dealBriefcaseSeedRaw ?? '',
      clickCount: 0,
      activePlayMs: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
      status: 'in_progress',
    }
  }

  function normalizeSession(session: GameSession): GameSession {
    return {
      ...session,
      dealBriefcaseSeedRaw: session.dealBriefcaseSeedRaw ?? '',
    }
  }

  function restoreFromSnapshot(snap: SessionSnapshot): void {
    gameSession.value = normalizeSession(snap.session)
  }

  function incrementClick(): void {
    const s = gameSession.value
    if (!s || s.status !== 'in_progress') {
      return
    }
    s.clickCount += 1
  }

  function addActiveMs(ms: number): void {
    const s = gameSession.value
    if (!s || s.status !== 'in_progress') {
      return
    }
    s.activePlayMs += ms
  }

  function buildSnapshot(memory: MemoryState): SessionSnapshot | null {
    const s = gameSession.value
    if (!s) {
      return null
    }
    return {
      schemaVersion: 1,
      session: { ...s },
      cells: memory.cells.map(
        (c): SnapshotTileCell => ({
          identityIndex: c.identityIndex,
          phase: c.phase,
        }),
      ),
      pair: { ...memory.pair },
    }
  }

  function flushSave(memory: MemoryState | null): void {
    if (!memory || !gameSession.value) {
      return
    }
    if (gameSession.value.status !== 'in_progress') {
      return
    }
    const snap = buildSnapshot(memory)
    if (!snap) {
      return
    }
    try {
      localStorage.setItem(STORAGE_IN_PROGRESS_KEY, JSON.stringify(snap))
      storageError.value = null
    } catch {
      storageError.value =
        'Could not save your game. Storage may be full or disabled.'
    }
  }

  function scheduleSave(memory: MemoryState | null): void {
    clearSaveTimer()
    saveTimer = setTimeout(() => {
      flushSave(memory)
      saveTimer = null
    }, 300)
  }

  function loadInProgressSnapshot(): SessionSnapshot | null {
    const snap = safeParse<SessionSnapshot>(
      localStorage.getItem(STORAGE_IN_PROGRESS_KEY),
    )
    if (!snap || snap.schemaVersion !== 1 || !snap.session || !snap.cells) {
      return null
    }
    return snap
  }

  function clearInProgressStorage(): void {
    try {
      localStorage.removeItem(STORAGE_IN_PROGRESS_KEY)
    } catch {
      /* ignore */
    }
  }

  function appendCompleted(row: CompletedSessionRecord): void {
    try {
      const list = readCompletedList()
      list.push(row)
      const trimmed =
        list.length > COMPLETED_SESSIONS_MAX
          ? list.slice(list.length - COMPLETED_SESSIONS_MAX)
          : list
      writeCompletedList(trimmed)
      storageError.value = null
    } catch {
      storageError.value =
        'Could not save session history. Storage may be full or disabled.'
    }
  }

  function clearSession(): void {
    clearSaveTimer()
    gameSession.value = null
  }

  function finalizeSession(outcome: 'won' | 'abandoned'): void {
    const s = gameSession.value
    if (!s) {
      return
    }
    clearSaveTimer()
    const completedAt = new Date().toISOString()
    const row: CompletedSessionRecord = {
      sessionId: s.sessionId,
      difficulty: s.difficulty,
      clickCount: s.clickCount,
      activePlayMs: s.activePlayMs,
      completedAt,
      outcome,
    }
    appendCompleted(row)
    clearInProgressStorage()
    gameSession.value = {
      ...s,
      status: outcome === 'won' ? 'won' : 'abandoned',
      completedAt,
    }
  }

  return {
    gameSession,
    storageError,
    beginSession,
    restoreFromSnapshot,
    incrementClick,
    addActiveMs,
    buildSnapshot,
    scheduleSave,
    flushSave,
    loadInProgressSnapshot,
    clearInProgressStorage,
    finalizeSession,
    readCompletedList,
    clearSession,
  }
})
