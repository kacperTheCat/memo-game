/**
 * Bundled UI / gameplay SFX. Web Audio API when available; HTMLAudioElement fallback.
 * Callers MUST NOT rely on throws — all errors are swallowed (spec SC-004).
 */

export type SfxCue = 'click' | 'flip' | 'success' | 'fail' | 'winRandom'

const FILE_MAP: Record<Exclude<SfxCue, 'winRandom'>, string> = {
  click: 'audio/click.mp3',
  flip: 'audio/flip.mp3',
  success: 'audio/success.mp3',
  fail: 'audio/fail.mp3',
}

const WIN_FILES = [
  'audio/terrorist-wins.mp3',
  'audio/counter-terrorists-win.mp3',
] as const

/** @internal tests */
export function joinSfxPublicUrl(baseUrl: string, relativePath: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const p = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
  return `${base}${p}`
}

export function sfxAssetUrl(relativePath: string): string {
  return joinSfxPublicUrl(import.meta.env.BASE_URL, relativePath)
}

/** @internal tests — uniform choice between the two win stings */
export function pickWinSoundFile(rng: () => number): string {
  return rng() < 0.5 ? WIN_FILES[0]! : WIN_FILES[1]!
}

function relPathForCue(cue: SfxCue): string {
  return cue === 'winRandom' ? pickWinSoundFile(Math.random) : FILE_MAP[cue]
}

let audioContext: AudioContext | null = null
let preferHtmlFallback = false
const bufferCache = new Map<string, AudioBuffer>()

function getAudioContextCtor(): (typeof AudioContext) | null {
  const g = globalThis as unknown as {
    AudioContext?: typeof AudioContext
    webkitAudioContext?: typeof AudioContext
  }
  return g.AudioContext ?? g.webkitAudioContext ?? null
}

async function getOrCreateContext(): Promise<AudioContext | null> {
  if (preferHtmlFallback) {
    return null
  }
  if (audioContext) {
    return audioContext
  }
  const Ctor = getAudioContextCtor()
  if (!Ctor) {
    preferHtmlFallback = true
    return null
  }
  try {
    audioContext = new Ctor()
    return audioContext
  } catch {
    preferHtmlFallback = true
    return null
  }
}

async function ensureBuffer(ctx: AudioContext, relPath: string): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(relPath)
  if (cached) {
    return cached
  }
  try {
    const url = sfxAssetUrl(relPath)
    const res = await fetch(url)
    if (!res.ok) {
      return null
    }
    const raw = await res.arrayBuffer()
    const buf = await ctx.decodeAudioData(raw.slice(0))
    bufferCache.set(relPath, buf)
    return buf
  } catch {
    return null
  }
}

function playBuffer(ctx: AudioContext, buf: AudioBuffer): void {
  try {
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start()
  } catch {
    /* ignore */
  }
}

function playHtml(relPath: string): void {
  try {
    const el = new Audio(sfxAssetUrl(relPath))
    void el.play()
  } catch {
    /* ignore */
  }
}

function logCueForTests(cue: SfxCue): void {
  if (import.meta.env.MODE !== 'test' || typeof window === 'undefined') {
    return
  }
  const w = window as unknown as { __MEMO_SFX?: SfxCue[] }
  if (!w.__MEMO_SFX) {
    w.__MEMO_SFX = []
  }
  w.__MEMO_SFX.push(cue)
}

export async function ensureSfxAudioUnlocked(): Promise<void> {
  try {
    const ctx = await getOrCreateContext()
    if (!ctx) {
      return
    }
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {})
    }
    if (preferHtmlFallback) {
      return
    }
    await Promise.all([
      ...Object.values(FILE_MAP).map((p) => ensureBuffer(ctx, p)),
      ...WIN_FILES.map((p) => ensureBuffer(ctx, p)),
    ]).catch(() => {})
  } catch {
    /* ignore */
  }
}

async function playSfxAsync(cue: SfxCue): Promise<void> {
  logCueForTests(cue)
  const relPath = relPathForCue(cue)
  try {
    await ensureSfxAudioUnlocked()
    const ctx = await getOrCreateContext()
    if (ctx && !preferHtmlFallback) {
      const buf = await ensureBuffer(ctx, relPath)
      if (buf) {
        playBuffer(ctx, buf)
        return
      }
    }
    preferHtmlFallback = true
    playHtml(relPath)
  } catch {
    preferHtmlFallback = true
    try {
      playHtml(relPath)
    } catch {
      /* ignore */
    }
  }
}

export function playSfx(cue: SfxCue): void {
  try {
    void playSfxAsync(cue)
  } catch {
    /* ignore */
  }
}

/** Convenience: resume context + click (primary buttons). */
export function playUiClick(): void {
  try {
    void ensureSfxAudioUnlocked()
    playSfx('click')
  } catch {
    /* ignore */
  }
}
