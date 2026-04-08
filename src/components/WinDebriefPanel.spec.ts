import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WinDebriefPanel from '@/components/WinDebriefPanel.vue'
import { useGameSessionStore } from '@/stores/gameSession'

describe('WinDebriefPanel', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
  })

  it('shows win-summary-time, win-summary-moves, and win-play-again after won session', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const session = useGameSessionStore()
    session.beginSession('easy')
    for (let i = 0; i < 10; i++) {
      session.incrementClick()
    }
    session.addActiveMs(90_000)
    session.finalizeSession('won')

    const wrapper = mount(WinDebriefPanel, {
      global: { plugins: [pinia] },
    })

    expect(wrapper.get('[data-testid="win-summary-time"]').text()).toBe('01:30')
    expect(wrapper.get('[data-testid="win-summary-moves"]').text()).toBe('10')
    expect(wrapper.find('[data-testid="win-play-again"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="win-history-table"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="win-return-briefcase"]').exists()).toBe(true)
  })
})
