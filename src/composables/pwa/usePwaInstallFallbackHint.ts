import { onMounted, onUnmounted, ref } from 'vue'
import { onInstallPromptAvailable } from '@/pwa/captureInstallPrompt'
import {
  hasPwaInstallSheetBeenOfferedThisTab,
  pwaFallbackHintSuppressedByDeferredPrompt,
  pwaInstallUiPersistenceBlocksOffers,
} from '@/pwa/pwaInstallUiGating'
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
    if (pwaInstallUiPersistenceBlocksOffers()) {
      showFallbackHint.value = false
      return
    }
    if (hasPwaInstallSheetBeenOfferedThisTab()) {
      showFallbackHint.value = false
      return
    }
    if (pwaFallbackHintSuppressedByDeferredPrompt()) {
      showFallbackHint.value = false
      return
    }
    showFallbackHint.value = true
  }

  onMounted(() => {
    if (isStandalonePwa()) {
      return
    }
    if (pwaInstallUiPersistenceBlocksOffers()) {
      return
    }
    if (hasPwaInstallSheetBeenOfferedThisTab()) {
      return
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
