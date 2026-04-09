/** True when the app is already running as an installed PWA (or iOS “Add to Home Screen”). */
export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const standaloneMq = window.matchMedia?.('(display-mode: standalone)')?.matches
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return Boolean(standaloneMq || iosStandalone)
}
