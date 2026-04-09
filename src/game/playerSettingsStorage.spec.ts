import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_PLAYER_SETTINGS_KEY } from '@/game/sessionConstants'
import { useGameSettingsStore } from '@/stores/gameSettings'
import {
  parsePlayerSettingsJson,
  persistPlayerSettingsFromStore,
  PLAYER_SETTINGS_SCHEMA_VERSION,
  readPlayerSettingsFromStorage,
  snapshotFromGameSettingsStore,
  subscribeDebouncedPlayerSettingsPersistence,
  toPlayerSettingsJson,
  writePlayerSettingsToStorage,
} from '@/game/playerSettingsStorage'

describe('playerSettingsStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('parsePlayerSettingsJson returns null for null, empty, invalid JSON', () => {
    expect(parsePlayerSettingsJson(null)).toBeNull()
    expect(parsePlayerSettingsJson('')).toBeNull()
    expect(parsePlayerSettingsJson('not-json')).toBeNull()
    expect(parsePlayerSettingsJson('{}')).toBeNull()
  })

  it('parsePlayerSettingsJson rejects wrong schemaVersion or difficulty', () => {
    expect(
      parsePlayerSettingsJson(
        JSON.stringify({
          schemaVersion: 2,
          difficulty: 'hard',
          briefcaseSeedRaw: '',
        }),
      ),
    ).toBeNull()
    expect(
      parsePlayerSettingsJson(
        JSON.stringify({
          schemaVersion: 1,
          difficulty: 'expert',
          briefcaseSeedRaw: '',
        }),
      ),
    ).toBeNull()
    expect(
      parsePlayerSettingsJson(
        JSON.stringify({
          schemaVersion: 1,
          difficulty: 'easy',
          briefcaseSeedRaw: 1,
        }),
      ),
    ).toBeNull()
  })

  it('parsePlayerSettingsJson accepts valid v1 document', () => {
    const doc = {
      schemaVersion: PLAYER_SETTINGS_SCHEMA_VERSION,
      difficulty: 'medium' as const,
      briefcaseSeedRaw: '123-456-789',
    }
    expect(parsePlayerSettingsJson(JSON.stringify(doc))).toEqual(doc)
  })

  it('toPlayerSettingsJson round-trips', () => {
    const doc = {
      schemaVersion: PLAYER_SETTINGS_SCHEMA_VERSION,
      difficulty: 'hard' as const,
      briefcaseSeedRaw: 'abc',
    }
    expect(parsePlayerSettingsJson(toPlayerSettingsJson(doc))).toEqual(doc)
  })

  it('read/write localStorage uses STORAGE_PLAYER_SETTINGS_KEY', () => {
    const doc = {
      schemaVersion: PLAYER_SETTINGS_SCHEMA_VERSION,
      difficulty: 'easy' as const,
      briefcaseSeedRaw: '',
    }
    writePlayerSettingsToStorage(doc)
    expect(localStorage.getItem(STORAGE_PLAYER_SETTINGS_KEY)).toBe(
      JSON.stringify(doc),
    )
    expect(readPlayerSettingsFromStorage()).toEqual(doc)
  })

  it('snapshotFromGameSettingsStore maps difficulty and briefcaseSeedRaw only', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const s = useGameSettingsStore()
    s.$patch({
      difficulty: 'hard',
      briefcaseSeedRaw: '999',
      dealSeed: 'x',
    })
    expect(snapshotFromGameSettingsStore(s)).toEqual({
      schemaVersion: PLAYER_SETTINGS_SCHEMA_VERSION,
      difficulty: 'hard',
      briefcaseSeedRaw: '999',
    })
  })

  it('subscribeDebouncedPlayerSettingsPersistence flushes after debounce', async () => {
    vi.useFakeTimers()
    const pinia = createPinia()
    setActivePinia(pinia)
    const s = useGameSettingsStore()
    subscribeDebouncedPlayerSettingsPersistence(pinia, 300)
    s.difficulty = 'hard'
    await vi.advanceTimersByTimeAsync(299)
    expect(readPlayerSettingsFromStorage()).toBeNull()
    await vi.advanceTimersByTimeAsync(2)
    expect(readPlayerSettingsFromStorage()?.difficulty).toBe('hard')
  })

  it('persistPlayerSettingsFromStore writes immediately', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const s = useGameSettingsStore()
    s.$patch({ difficulty: 'easy', briefcaseSeedRaw: 'z' })
    persistPlayerSettingsFromStore(s)
    expect(readPlayerSettingsFromStorage()?.briefcaseSeedRaw).toBe('z')
  })
})
