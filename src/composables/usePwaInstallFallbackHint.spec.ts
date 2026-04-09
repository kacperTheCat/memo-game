import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import * as capture from '@/pwa/captureInstallPrompt'
import { usePwaInstallFallbackHint } from '@/composables/usePwaInstallFallbackHint'

describe('usePwaInstallFallbackHint', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
    vi.stubGlobal('sessionStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shows hint after delay when install still pending and no deferred prompt', async () => {
    vi.spyOn(capture, 'peekDeferredInstallPrompt').mockReturnValue(null)

    const Test = defineComponent({
      setup() {
        const { showFallbackHint } = usePwaInstallFallbackHint()
        return { showFallbackHint }
      },
      template: '<div data-show>{{ showFallbackHint }}</div>',
    })

    const wrapper = mount(Test)
    await flushPromises()
    expect(wrapper.text()).toContain('false')

    await vi.advanceTimersByTimeAsync(12_000)
    await flushPromises()
    expect(wrapper.text()).toContain('true')
  })

  it('does not show hint when deferred prompt exists at evaluation time', async () => {
    const fakePrompt = { prompt: async () => {} } as unknown as BeforeInstallPromptEvent
    vi.spyOn(capture, 'peekDeferredInstallPrompt').mockReturnValue(fakePrompt)

    const Test = defineComponent({
      setup() {
        const { showFallbackHint } = usePwaInstallFallbackHint()
        return { showFallbackHint }
      },
      template: '<div data-show>{{ showFallbackHint }}</div>',
    })

    const wrapper = mount(Test)
    await flushPromises()
    await vi.advanceTimersByTimeAsync(12_000)
    await flushPromises()

    expect(wrapper.text()).toContain('false')
  })
})
