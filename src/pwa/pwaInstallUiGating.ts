import {
  blocksPwaInstallSheet,
  readPwaInstallUiFromStorage,
} from '@/game/storage/pwaInstallUiStorage'
import { SESSION_STORAGE_PWA_INSTALL_SHEET_OFFERED_KEY } from '@/game/storage/sessionConstants'
import { peekDeferredInstallPrompt } from '@/pwa/captureInstallPrompt'

/** `true` when this tab already showed the install sheet once (sessionStorage). */
export function hasPwaInstallSheetBeenOfferedThisTab(): boolean {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_PWA_INSTALL_SHEET_OFFERED_KEY) === '1'
  } catch {
    return false
  }
}

export function markPwaInstallSheetOfferedThisTab(): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_PWA_INSTALL_SHEET_OFFERED_KEY, '1')
  } catch {
    /* private mode */
  }
}

/** Matches sheet gating: deferred event present and exposes `prompt`. */
export function hasUsableDeferredInstallPrompt(): boolean {
  const ev = peekDeferredInstallPrompt()
  return Boolean(ev && typeof ev.prompt === 'function')
}

/** Dismissed or installed in localStorage — suppress sheet and fallback hint. */
export function pwaInstallUiPersistenceBlocksOffers(): boolean {
  return blocksPwaInstallSheet(readPwaInstallUiFromStorage().outcome)
}

/** Hide fallback hint when a deferred native prompt exists. */
export function pwaFallbackHintSuppressedByDeferredPrompt(): boolean {
  return Boolean(peekDeferredInstallPrompt())
}
