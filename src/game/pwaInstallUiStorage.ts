import { STORAGE_PWA_INSTALL_UI_KEY } from '@/game/sessionConstants'

export const PWA_INSTALL_UI_SCHEMA_VERSION = 1 as const

export type PwaInstallUiOutcome = 'pending' | 'seen' | 'dismissed' | 'installed'

export type PwaInstallUiStateV1 = {
  schemaVersion: typeof PWA_INSTALL_UI_SCHEMA_VERSION
  outcome: PwaInstallUiOutcome
}

export function parsePwaInstallUiJson(raw: string | null): PwaInstallUiStateV1 | null {
  if (raw == null || raw === '') {
    return null
  }
  try {
    const v = JSON.parse(raw) as unknown
    if (!v || typeof v !== 'object') {
      return null
    }
    const o = v as Record<string, unknown>
    if (o.schemaVersion !== PWA_INSTALL_UI_SCHEMA_VERSION) {
      return null
    }
    const outcome = o.outcome
    if (
      outcome !== 'pending' &&
      outcome !== 'seen' &&
      outcome !== 'dismissed' &&
      outcome !== 'installed'
    ) {
      return null
    }
    return {
      schemaVersion: PWA_INSTALL_UI_SCHEMA_VERSION,
      outcome,
    }
  } catch {
    return null
  }
}

export function defaultPwaInstallUiState(): PwaInstallUiStateV1 {
  return {
    schemaVersion: PWA_INSTALL_UI_SCHEMA_VERSION,
    outcome: 'pending',
  }
}

export function readPwaInstallUiFromStorage(): PwaInstallUiStateV1 {
  try {
    return parsePwaInstallUiJson(localStorage.getItem(STORAGE_PWA_INSTALL_UI_KEY)) ??
      defaultPwaInstallUiState()
  } catch {
    return defaultPwaInstallUiState()
  }
}

export function writePwaInstallUiToStorage(s: PwaInstallUiStateV1): void {
  try {
    localStorage.setItem(STORAGE_PWA_INSTALL_UI_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

export function markPwaInstallOutcome(outcome: PwaInstallUiOutcome): void {
  writePwaInstallUiToStorage({
    schemaVersion: PWA_INSTALL_UI_SCHEMA_VERSION,
    outcome,
  })
}
