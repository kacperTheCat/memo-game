import { onMounted, onUnmounted, ref } from 'vue'
import { onInstallPromptAvailable, peekDeferredInstallPrompt } from '@/pwa/captureInstallPrompt'
import { blocksPwaInstallSheet, readPwaInstallUiFromStorage } from '@/game/pwaInstallUiStorage'
import { SESSION_STORAGE_PWA_INSTALL_SHEET_OFFERED_KEY } from '@/game/sessionConstants'
import { isStandalonePwa } from '@/pwa/isStandalonePwa'

/** When `beforeinstallprompt` never fires, explain address-bar install + offline misconception. */
const HINT_DELAY_MS = 12_000

export function usePwaInstallFallbackHint() {
  const showFallbackHint = ref(false)
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let stopAvailable: (() => void) | null = null

  function evaluate(): void {
    if (typeof window === 'undefined') {
      return
    }
    if (isStandalonePwa()) {
      showFallbackHint.value = false
      return
    }
    if (blocksPwaInstallSheet(readPwaInstallUiFromStorage().outcome)) {
      showFallbackHint.value = false
      return
    }
    try {
      if (sessionStorage.getItem(SESSION_STORAGE_PWA_INSTALL_SHEET_OFFERED_KEY) === '1') {
        showFallbackHint.value = false
        return
      }
    } catch {
      /* private mode */
    }
    if (peekDeferredInstallPrompt()) {
      showFallbackHint.value = false
      return
    }
    showFallbackHint.value = true
  }

  onMounted(() => {
    if (isStandalonePwa()) {
      return
    }
    if (blocksPwaInstallSheet(readPwaInstallUiFromStorage().outcome)) {
      return
    }
    try {
      if (sessionStorage.getItem(SESSION_STORAGE_PWA_INSTALL_SHEET_OFFERED_KEY) === '1') {
        return
      }
    } catch {
      /* private mode */
    }
    stopAvailable = onInstallPromptAvailable(() => {
      showFallbackHint.value = false
    })
    timeoutId = window.setTimeout(() => evaluate(), HINT_DELAY_MS)
  })

  onUnmounted(() => {
    if (timeoutId != null) {
      window.clearTimeout(timeoutId)
      timeoutId = null
    }
    stopAvailable?.()
    stopAvailable = null
  })

  return { showFallbackHint }
}
