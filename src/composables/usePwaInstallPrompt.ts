import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { markPwaInstallOutcome, readPwaInstallUiFromStorage } from '@/game/pwaInstallUiStorage'

function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const standaloneMq = window.matchMedia?.('(display-mode: standalone)')?.matches
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return Boolean(standaloneMq || iosStandalone)
}

export function usePwaInstallPrompt() {
  const visible = ref(false)
  const deferred = shallowRef<BeforeInstallPromptEvent | null>(null)

  function onBeforeInstallPrompt(e: Event): void {
    e.preventDefault()
    const ev = e as BeforeInstallPromptEvent
    if (typeof ev.prompt !== 'function') {
      return
    }
    deferred.value = ev

    if (isStandalonePwa()) {
      markPwaInstallOutcome('installed')
      return
    }

    const st = readPwaInstallUiFromStorage()
    if (st.outcome !== 'pending') {
      return
    }

    visible.value = true
    markPwaInstallOutcome('seen')
  }

  function onAppInstalled(): void {
    markPwaInstallOutcome('installed')
    visible.value = false
    deferred.value = null
  }

  onMounted(() => {
    if (isStandalonePwa()) {
      markPwaInstallOutcome('installed')
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
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
      /* user dismissed native prompt — keep seen state */
    }
    deferred.value = null
  }

  function dismiss(): void {
    markPwaInstallOutcome('dismissed')
    visible.value = false
    deferred.value = null
  }

  return { visible, confirmInstall, dismiss }
}
