/**
 * `beforeinstallprompt` often fires before Vue has mounted. A capture listener
 * registered synchronously from `main.ts` keeps the deferred prompt so the UI
 * can show online as well as offline.
 */
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null

export function peekDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredInstallPrompt
}

export function clearDeferredInstallPrompt(): void {
  deferredInstallPrompt = null
}

const AVAILABLE = 'memo-installprompt-available'

export function onInstallPromptAvailable(cb: () => void): () => void {
  window.addEventListener(AVAILABLE, cb)
  return () => window.removeEventListener(AVAILABLE, cb)
}

export function registerInstallPromptCapture(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.addEventListener(
    'beforeinstallprompt',
    (e) => {
      const ev = e as BeforeInstallPromptEvent
      if (typeof ev.prompt !== 'function') {
        return
      }
      e.preventDefault()
      deferredInstallPrompt = ev
      window.dispatchEvent(new Event(AVAILABLE))
    },
    { capture: true },
  )
}
