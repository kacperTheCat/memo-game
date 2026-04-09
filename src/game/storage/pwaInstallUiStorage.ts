import { STORAGE_PWA_INSTALL_UI_KEY } from '@/game/storage/sessionConstants'

export const PWA_INSTALL_UI_SCHEMA_VERSION = 1 as const

/** Parsed from disk; may include legacy `seen`. */
export type PwaInstallUiOutcome = 'pending' | 'seen' | 'dismissed' | 'installed'

/** Values we persist via `markPwaInstallOutcome` (no `seen` — use sessionStorage for per-tab dedupe). */
export type PwaInstallUiWritableOutcome = 'pending' | 'dismissed' | 'installed'

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

export function blocksPwaInstallSheet(outcome: PwaInstallUiOutcome): boolean {
  return outcome === 'dismissed' || outcome === 'installed'
}

export function readPwaInstallUiFromStorage(): PwaInstallUiStateV1 {
  try {
    let s =
      parsePwaInstallUiJson(localStorage.getItem(STORAGE_PWA_INSTALL_UI_KEY)) ??
      defaultPwaInstallUiState()
    /** Legacy: `seen` prevented the sheet after refresh while `preventDefault()` blocked Chrome’s banner. */
    if (s.outcome === 'seen') {
      s = { schemaVersion: PWA_INSTALL_UI_SCHEMA_VERSION, outcome: 'pending' }
      writePwaInstallUiToStorage(s)
    }
    return s
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

export function markPwaInstallOutcome(outcome: PwaInstallUiWritableOutcome): void {
  writePwaInstallUiToStorage({
    schemaVersion: PWA_INSTALL_UI_SCHEMA_VERSION,
    outcome,
  })
}
