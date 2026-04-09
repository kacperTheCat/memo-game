import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import {
  clearDeferredInstallPrompt,
  onInstallPromptAvailable,
  peekDeferredInstallPrompt,
} from '@/pwa/captureInstallPrompt'
import { markPwaInstallOutcome } from '@/game/pwaInstallUiStorage'
import {
  hasPwaInstallSheetBeenOfferedThisTab,
  hasUsableDeferredInstallPrompt,
  markPwaInstallSheetOfferedThisTab,
  pwaInstallUiPersistenceBlocksOffers,
} from '@/pwa/pwaInstallUiGating'
import { isStandalonePwa } from '@/pwa/isStandalonePwa'

/** Extra attempts: Chrome may emit `beforeinstallprompt` well after first paint. */
const INSTALL_SHEET_RETRY_MS = [2000, 6000, 14_000] as const

export function usePwaInstallPrompt() {
  const visible = ref(false)
  const deferred = shallowRef<BeforeInstallPromptEvent | null>(null)

  function tryOfferInstallSheet(): void {
    if (isStandalonePwa()) {
      markPwaInstallOutcome('installed')
      clearDeferredInstallPrompt()
      deferred.value = null
      return
    }

    if (pwaInstallUiPersistenceBlocksOffers()) {
      clearDeferredInstallPrompt()
      deferred.value = null
      return
    }

    if (hasPwaInstallSheetBeenOfferedThisTab()) {
      return
    }

    if (!hasUsableDeferredInstallPrompt()) {
      return
    }

    markPwaInstallSheetOfferedThisTab()
    deferred.value = peekDeferredInstallPrompt()
    visible.value = true
  }

  function onAppInstalled(): void {
    markPwaInstallOutcome('installed')
    visible.value = false
    clearDeferredInstallPrompt()
    deferred.value = null
  }

  let stopAvailable: (() => void) | null = null
  let removeLoadListener: (() => void) | null = null
  let removeControllerListener: (() => void) | null = null
  const retryTimeouts: number[] = []

  onMounted(() => {
    if (isStandalonePwa()) {
      markPwaInstallOutcome('installed')
    }
    tryOfferInstallSheet()
    stopAvailable = onInstallPromptAvailable(() => tryOfferInstallSheet())
    window.addEventListener('appinstalled', onAppInstalled)

    /** `beforeinstallprompt` often arrives after first paint or once the SW controls the client. */
    const onLoad = (): void => {
      tryOfferInstallSheet()
    }
    if (document.readyState === 'complete') {
      queueMicrotask(onLoad)
    } else {
      window.addEventListener('load', onLoad, { once: true })
      removeLoadListener = () => window.removeEventListener('load', onLoad)
    }

    const onControllerChange = (): void => {
      tryOfferInstallSheet()
    }
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        queueMicrotask(() => tryOfferInstallSheet())
      } else {
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          onControllerChange,
          { once: true },
        )
        removeControllerListener = () =>
          navigator.serviceWorker.removeEventListener(
            'controllerchange',
            onControllerChange,
          )
      }
    }

    for (const ms of INSTALL_SHEET_RETRY_MS) {
      retryTimeouts.push(window.setTimeout(() => tryOfferInstallSheet(), ms))
    }
  })

  onUnmounted(() => {
    for (const id of retryTimeouts) {
      window.clearTimeout(id)
    }
    retryTimeouts.length = 0
    stopAvailable?.()
    stopAvailable = null
    removeLoadListener?.()
    removeLoadListener = null
    removeControllerListener?.()
    removeControllerListener = null
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  async function confirmInstall(): Promise<void> {
    const d = deferred.value
    if (!d) {
      return
    }
    try {
      await d.prompt()
    } catch {
      /* user dismissed native prompt — keep dismissed/install flow out of localStorage until Not now */
    }
    clearDeferredInstallPrompt()
    deferred.value = null
  }

  function dismiss(): void {
    markPwaInstallOutcome('dismissed')
    visible.value = false
    clearDeferredInstallPrompt()
    deferred.value = null
  }

  return { visible, confirmInstall, dismiss }
}
