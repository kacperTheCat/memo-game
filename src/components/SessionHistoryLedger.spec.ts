import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SessionHistoryLedger from '@/components/SessionHistoryLedger.vue'
import { useGameSessionStore } from '@/stores/gameSession'

describe('SessionHistoryLedger', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
  })

  it('shows empty state when no won sessions', () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(SessionHistoryLedger, {
      global: { plugins: [pinia] },
      props: { showSectionHeader: false },
    })

    expect(wrapper.get('[data-testid="session-history-table"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="session-history-empty"]').text()).toContain(
      'No operational data found',
    )
  })

  it('shows a row after a won session is recorded', () => {
    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
    })

    const pinia = createPinia()
    setActivePinia(pinia)
    const session = useGameSessionStore()
    session.beginSession('easy')
    session.finalizeSession('won')

    const wrapper = mount(SessionHistoryLedger, {
      global: { plugins: [pinia] },
      props: { showSectionHeader: false },
    })

    expect(wrapper.find('[data-testid="session-history-empty"]').exists()).toBe(false)
    expect(wrapper.find('tbody tr').exists()).toBe(true)
  })
})
