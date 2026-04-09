import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_PWA_INSTALL_UI_KEY } from '@/game/sessionConstants'
import {
  defaultPwaInstallUiState,
  markPwaInstallOutcome,
  parsePwaInstallUiJson,
  readPwaInstallUiFromStorage,
  writePwaInstallUiToStorage,
} from '@/game/pwaInstallUiStorage'

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

  it('supports pending → seen → dismissed transition', () => {
    markPwaInstallOutcome('pending')
    expect(readPwaInstallUiFromStorage().outcome).toBe('pending')
    markPwaInstallOutcome('seen')
    expect(readPwaInstallUiFromStorage().outcome).toBe('seen')
    markPwaInstallOutcome('dismissed')
    expect(readPwaInstallUiFromStorage().outcome).toBe('dismissed')
  })
})
