import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  joinSfxPublicUrl,
  pickWinSoundFile,
  playSfx,
  sfxAssetUrl,
} from './gameSfx'

describe('joinSfxPublicUrl', () => {
  it('normalizes trailing slash on base', () => {
    expect(joinSfxPublicUrl('/app/', 'audio/x.mp3')).toBe('/app/audio/x.mp3')
    expect(joinSfxPublicUrl('/app', 'audio/x.mp3')).toBe('/app/audio/x.mp3')
  })

  it('strips leading slash on relative path', () => {
    expect(joinSfxPublicUrl('/', '/audio/x.mp3')).toBe('/audio/x.mp3')
  })
})

describe('pickWinSoundFile', () => {
  it('returns first file when rng < 0.5', () => {
    expect(pickWinSoundFile(() => 0)).toBe('audio/terrorist-wins.mp3')
    expect(pickWinSoundFile(() => 0.49)).toBe('audio/terrorist-wins.mp3')
  })

  it('returns second file when rng >= 0.5', () => {
    expect(pickWinSoundFile(() => 0.5)).toBe('audio/counter-terrorists-win.mp3')
    expect(pickWinSoundFile(() => 0.99)).toBe('audio/counter-terrorists-win.mp3')
  })
})

describe('playSfx', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        }),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not throw when AudioContext is missing', () => {
    const orig = globalThis.AudioContext
    // @ts-expect-error test
    delete globalThis.AudioContext
    // @ts-expect-error test
    delete globalThis.webkitAudioContext

    expect(() => playSfx('click')).not.toThrow()

    globalThis.AudioContext = orig
  })

  it('sfxAssetUrl uses import.meta.env.BASE_URL', () => {
    const u = sfxAssetUrl('audio/click.mp3')
    expect(u).toContain('audio/click.mp3')
  })
})
