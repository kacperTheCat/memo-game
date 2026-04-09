/** Pure timing for Operation Complete heading stagger (010). */

export function operationCompleteMaxDurationMs(
  charCount: number,
  delayPerCharMs: number,
  charAnimMs: number,
): number {
  return Math.max(0, charCount - 1) * delayPerCharMs + charAnimMs
}
