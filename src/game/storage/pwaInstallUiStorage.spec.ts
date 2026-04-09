import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_PWA_INSTALL_UI_KEY } from '@/game/storage/sessionConstants'
import {
  blocksPwaInstallSheet,
  defaultPwaInstallUiState,
  markPwaInstallOutcome,
  parsePwaInstallUiJson,
  readPwaInstallUiFromStorage,
  writePwaInstallUiToStorage,
} from '@/game/storage/pwaInstallUiStorage'

describe('pwaInstallUiStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('parsePwaInstallUiJson returns null for invalid', () => {
    expect(parsePwaInstallUiJson(null)).toBeNull()
    expect(parsePwaInstallUiJson('')).toBeNull()
    expect(parsePwaInstallUiJson('{')).toBeNull()
    expect(parsePwaInstallUiJson('{}')).toBeNull()
  })

  it('readPwaInstallUiFromStorage defaults to pending when missing', () => {
    expect(readPwaInstallUiFromStorage()).toEqual(defaultPwaInstallUiState())
  })

  it('writePwaInstallUiToStorage persists under key', () => {
    const st = { schemaVersion: 1 as const, outcome: 'seen' as const }
    writePwaInstallUiToStorage(st)
    expect(localStorage.getItem(STORAGE_PWA_INSTALL_UI_KEY)).toBe(JSON.stringify(st))
  })

  it('markPwaInstallOutcome updates outcome', () => {
    markPwaInstallOutcome('dismissed')
    expect(readPwaInstallUiFromStorage().outcome).toBe('dismissed')
    markPwaInstallOutcome('installed')
    expect(readPwaInstallUiFromStorage().outcome).toBe('installed')
  })

  it('migrates legacy seen outcome to pending on read', () => {
    writePwaInstallUiToStorage({ schemaVersion: 1, outcome: 'seen' })
    expect(readPwaInstallUiFromStorage().outcome).toBe('pending')
    expect(JSON.parse(localStorage.getItem(STORAGE_PWA_INSTALL_UI_KEY)!).outcome).toBe('pending')
  })

  it('blocksPwaInstallSheet only for dismissed and installed', () => {
    expect(blocksPwaInstallSheet('pending')).toBe(false)
    expect(blocksPwaInstallSheet('seen')).toBe(false)
    expect(blocksPwaInstallSheet('dismissed')).toBe(true)
    expect(blocksPwaInstallSheet('installed')).toBe(true)
  })

  it('supports pending → dismissed transition', () => {
    markPwaInstallOutcome('pending')
    expect(readPwaInstallUiFromStorage().outcome).toBe('pending')
    markPwaInstallOutcome('dismissed')
    expect(readPwaInstallUiFromStorage().outcome).toBe('dismissed')
  })
})
