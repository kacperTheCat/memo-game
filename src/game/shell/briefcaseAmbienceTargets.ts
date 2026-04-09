/** Normalized 0..1 positions for briefcase smoke blobs (010). */

export interface BlobTarget {
  x: number
  y: number
  scale: number
  radiusPct: number
}

export function randomBlobTarget(rng: () => number): BlobTarget {
  return {
    x: 0.12 + rng() * 0.76,
    y: 0.12 + rng() * 0.76,
    scale: 0.85 + rng() * 0.55,
    radiusPct: 38 + rng() * 22,
  }
}

export function springScalar(
  current: number,
  target: number,
  dtMs: number,
  tauMs: number,
): number {
  if (tauMs <= 0) {
    return target
  }
  const k = 1 - Math.exp(-dtMs / tauMs)
  return current + (target - current) * k
}
