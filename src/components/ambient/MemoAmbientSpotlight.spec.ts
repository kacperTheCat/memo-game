import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MemoAmbientSpotlight from '@/components/ambient/MemoAmbientSpotlight.vue'

async function flushFrames(count = 8): Promise<void> {
  for (let i = 0; i < count; i++) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })
  }
}

describe('MemoAmbientSpotlight', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders spotlight test id and active attribute', async () => {
    const w = mount(MemoAmbientSpotlight)
    await flushPromises()
    const el = w.find('[data-testid="ambient-spotlight"]')
    expect(el.exists()).toBe(true)
    expect(['true', 'false']).toContain(
      el.attributes('data-ambient-spotlight-active'),
    )
    w.unmount()
  })

  it('marks spotlight active under reduced motion (static dim)', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    const w = mount(MemoAmbientSpotlight)
    await flushPromises()
    await flushFrames(4)
    expect(
      w.find('[data-testid="ambient-spotlight"]').attributes(
        'data-ambient-spotlight-active',
      ),
    ).toBe('true')
    w.unmount()
  })

  it('becomes active after mouse pointer moves', async () => {
    const iw = vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024)
    const ih = vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(768)
    // Happy-DOM rAF runs on real time; long rAF chains can exceed AMBIENT_MOUSE_IDLE_MS vs last move.
    let mockedNow = 10_000
    const nowSpy = vi
      .spyOn(performance, 'now')
      .mockImplementation(() => mockedNow)
    async function flushFramesFixedClock(count: number): Promise<void> {
      for (let i = 0; i < count; i++) {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve())
        })
        mockedNow += 16
      }
    }
    const w = mount(MemoAmbientSpotlight)
    await flushPromises()
    await flushFramesFixedClock(4)
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        clientX: 80,
        clientY: 90,
        pointerId: 1,
        pointerType: 'mouse',
      }),
    )
    await flushFramesFixedClock(12)
    expect(
      w.find('[data-testid="ambient-spotlight"]').attributes(
        'data-ambient-spotlight-active',
      ),
    ).toBe('true')
    nowSpy.mockRestore()
    iw.mockRestore()
    ih.mockRestore()
    w.unmount()
  })

  it('exposes viewport-normalized pointer attributes (fixed layer contract)', async () => {
    const innerW = 800
    const innerH = 600
    const iw = vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(innerW)
    const ih = vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(innerH)
    const w = mount(MemoAmbientSpotlight)
    await flushPromises()
    await flushFrames(4)
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        clientX: 400,
        clientY: 300,
        pointerId: 1,
        pointerType: 'mouse',
      }),
    )
    await flushFrames(20)
    const el = w.find('[data-testid="ambient-spotlight"]')
    const xp = Number(el.attributes('data-memo-spotlight-vp-x'))
    const yp = Number(el.attributes('data-memo-spotlight-vp-y'))
    // Spring + drift (FR-001a) keep the centroid near, not exactly on, the pointer.
    expect(xp).toBeGreaterThanOrEqual(47)
    expect(xp).toBeLessThanOrEqual(53)
    expect(yp).toBeGreaterThanOrEqual(47)
    expect(yp).toBeLessThanOrEqual(53)
    iw.mockRestore()
    ih.mockRestore()
    w.unmount()
  })
})
