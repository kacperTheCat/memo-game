/**
 * Debug peek (show all tile faces) is for local dev on loopback only.
 * Avoids exposing the control when DEV is true but the page is served from a tunnel / vercel dev host.
 */
export function isLoopbackHostname(hostname: string): boolean {
  const h = hostname.trim().toLowerCase()
  if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]') {
    return true
  }
  return false
}

export function showGameDebugPeekUi(): boolean {
  if (!import.meta.env.DEV) {
    return false
  }
  if (typeof window === 'undefined') {
    return false
  }
  return isLoopbackHostname(window.location.hostname)
}
