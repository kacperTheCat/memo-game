import { onMounted, onUnmounted } from 'vue'

/**
 * Accumulates active play time only while the tab is visible and the document has focus (FR-009).
 */
export function useActivePlayTime(onDelta: (ms: number) => void): void {
  let raf = 0
  let last = performance.now()

  const frame = (t: number) => {
    const active =
      document.visibilityState === 'visible' &&
      (typeof document.hasFocus === 'function' ? document.hasFocus() : true)
    if (active) {
      const dt = t - last
      if (dt > 0 && dt < 250) {
        onDelta(dt)
      }
    }
    last = t
    raf = requestAnimationFrame(frame)
  }

  onMounted(() => {
    last = performance.now()
    raf = requestAnimationFrame(frame)
  })

  onUnmounted(() => {
    cancelAnimationFrame(raf)
  })
}
