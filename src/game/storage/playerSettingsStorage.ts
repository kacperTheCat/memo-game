import type { Pinia } from 'pinia'
import { isDifficulty } from '@/game/library/isDifficulty'
import type { Difficulty } from '@/game/library/tileLibraryTypes'
import { STORAGE_PLAYER_SETTINGS_KEY } from '@/game/storage/sessionConstants'
import { useGameSettingsStore } from '@/stores/game/gameSettings'

export const PLAYER_SETTINGS_SCHEMA_VERSION = 1 as const

export type PlayerSettingsV1 = {
  schemaVersion: typeof PLAYER_SETTINGS_SCHEMA_VERSION
  difficulty: Difficulty
  briefcaseSeedRaw: string
}

export function parsePlayerSettingsJson(raw: string | null): PlayerSettingsV1 | null {
  if (raw == null || raw === '') {
    return null
  }
  try {
    const v = JSON.parse(raw) as unknown
    if (!v || typeof v !== 'object') {
      return null
    }
    const o = v as Record<string, unknown>
    if (o.schemaVersion !== PLAYER_SETTINGS_SCHEMA_VERSION) {
      return null
    }
    if (!isDifficulty(o.difficulty)) {
      return null
    }
    if (typeof o.briefcaseSeedRaw !== 'string') {
      return null
    }
    return {
      schemaVersion: PLAYER_SETTINGS_SCHEMA_VERSION,
      difficulty: o.difficulty,
      briefcaseSeedRaw: o.briefcaseSeedRaw,
    }
  } catch {
    return null
  }
}

export function toPlayerSettingsJson(s: PlayerSettingsV1): string {
  return JSON.stringify(s)
}

export function readPlayerSettingsFromStorage(): PlayerSettingsV1 | null {
  try {
    return parsePlayerSettingsJson(localStorage.getItem(STORAGE_PLAYER_SETTINGS_KEY))
  } catch {
    return null
  }
}

export function writePlayerSettingsToStorage(s: PlayerSettingsV1): void {
  try {
    localStorage.setItem(STORAGE_PLAYER_SETTINGS_KEY, toPlayerSettingsJson(s))
  } catch {
    /* quota / private mode — ignore */
  }
}

export function snapshotFromGameSettingsStore(store: {
  difficulty: Difficulty
  briefcaseSeedRaw: string
}): PlayerSettingsV1 {
  return {
    schemaVersion: PLAYER_SETTINGS_SCHEMA_VERSION,
    difficulty: store.difficulty,
    briefcaseSeedRaw: store.briefcaseSeedRaw,
  }
}

export function persistPlayerSettingsFromStore(store: {
  difficulty: Difficulty
  briefcaseSeedRaw: string
}): void {
  writePlayerSettingsToStorage(snapshotFromGameSettingsStore(store))
}

export function hydrateGameSettingsFromStorage(pinia: Pinia): void {
  const parsed = readPlayerSettingsFromStorage()
  if (!parsed) {
    return
  }
  const settings = useGameSettingsStore(pinia)
  settings.$patch({
    difficulty: parsed.difficulty,
    briefcaseSeedRaw: parsed.briefcaseSeedRaw,
  })
}

export function subscribeDebouncedPlayerSettingsPersistence(
  pinia: Pinia,
  debounceMs = 300,
): () => void {
  const settings = useGameSettingsStore(pinia)
  let timer: ReturnType<typeof setTimeout> | null = null

  const flush = (): void => {
    persistPlayerSettingsFromStore(settings)
    timer = null
  }

  const stop = settings.$subscribe(() => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(flush, debounceMs)
  })

  return () => {
    if (timer) {
      clearTimeout(timer)
      flush()
    }
    stop()
  }
}
