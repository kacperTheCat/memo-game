/**
 * Deterministic PRNG for reproducible deals (e2e / optional player seed).
 */
export function hashStringToUint32(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return h >>> 0
}

/** Returns floats in [0, 1), same sequence for the same seed string. */
export function createSeededRandom(seed: string): () => number {
  let state = hashStringToUint32(seed)
  if (state === 0) {
    state = 0x9e3779b9
  }
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
