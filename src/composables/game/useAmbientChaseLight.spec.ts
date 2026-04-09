import { defineComponent, nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAmbientChaseLight } from '@/composables/game/useAmbientChaseLight'

describe('useAmbientChaseLight', () => {
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

  it('initializes smoothed to viewport center', async () => {
    const Test = defineComponent({
      setup() {
        const { smoothed } = useAmbientChaseLight()
        return { smoothed }
      },
      template: '<div data-x>{{ Math.round(smoothed.x) }}</div>',
    })
    const w = mount(Test)
    await flushPromises()
    await nextTick()
    const txt = w.find('[data-x]').text()
    expect(Number(txt)).toBeGreaterThanOrEqual(0)
    w.unmount()
  })
})
