import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HubGrainLayer from '@/components/layout/HubGrainLayer.vue'

describe('HubGrainLayer', () => {
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

  it('includes drift animation class on noise layer', () => {
    const w = mount(HubGrainLayer)
    const noise = w.find('[data-testid="hub-grain-noise"]')
    expect(noise.exists()).toBe(true)
    expect(noise.classes().join(' ')).toContain('hub-grain-noise-drift')
    w.unmount()
  })
})
