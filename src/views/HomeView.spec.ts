import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { playUiClick } = vi.hoisted(() => ({ playUiClick: vi.fn() }))

vi.mock('@/audio/gameSfx', () => ({
  playUiClick,
}))

import HomeView from '@/views/HomeView.vue'
import { navConfigureGame, navReturnToGame } from '@/constants/appCopy'
import { useGameSessionStore } from '@/stores/gameSession'

describe('HomeView', () => {
  beforeEach(() => {
    playUiClick.mockClear()
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
  })

  it('hides Return to Game when no in-progress session', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
      ],
    })
    await router.push('/')

    const wrapper = mount(HomeView, {
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="home-return-game"]').exists()).toBe(false)
    const configure = wrapper.get('[data-testid="home-configure-game"]')
    expect(configure.exists()).toBe(true)
    expect(configure.classes().join(' ')).toMatch(/bg-memo-accent/)
    expect(configure.text()).toContain(navConfigureGame)
  })

  it('shows Return to Game when session is in progress', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const session = useGameSessionStore()
    session.beginSession('medium')

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
      ],
    })
    await router.push('/')

    const wrapper = mount(HomeView, {
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    const returnGame = wrapper.get('[data-testid="home-return-game"]')
    expect(returnGame.text()).toContain(navReturnToGame)
    expect(returnGame.classes().join(' ')).not.toMatch(/bg-memo-accent/)
  })

  it('plays UI click when Configure New Game is activated (FR-005)', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
      ],
    })
    await router.push('/')

    const wrapper = mount(HomeView, {
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    await wrapper.get('[data-testid="home-configure-game"]').trigger('click')
    expect(playUiClick).toHaveBeenCalledTimes(1)
  })
})
