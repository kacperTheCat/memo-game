import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameView from '@/views/game/GameView.vue'
import { useGameSessionStore } from '@/stores/game/gameSession'

describe('GameView active-play navigation', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
  })

  it('Return to Briefcase calls flushSave and router.push briefcase without clearSession', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/game', name: 'game', component: GameView },
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/', name: 'home', component: { template: '<div/>' } },
      ],
    })
    await router.push('/game')

    const session = useGameSessionStore()
    session.beginSession('easy')
    const flushSpy = vi.spyOn(session, 'flushSave').mockImplementation(() => {})
    const clearSpy = vi.spyOn(session, 'clearSession')
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

    const wrapper = mount(GameView, {
      global: {
        plugins: [pinia, router],
        stubs: {
          GameCanvasShell: { template: '<div data-testid="game-canvas-stub" />' },
          WinDebriefPanel: true,
        },
      },
    })

    await flushPromises()
    await wrapper.get('[data-testid="game-return-briefcase"]').trigger('click')

    expect(flushSpy).toHaveBeenCalled()
    expect(pushSpy).toHaveBeenCalledWith({ name: 'briefcase' })
    expect(clearSpy).not.toHaveBeenCalled()
  })
})
