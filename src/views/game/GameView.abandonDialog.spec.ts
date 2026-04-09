import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GameView from '@/views/game/GameView.vue'
import { useGamePlayStore } from '@/stores/game/gamePlay'
import { useGameSessionStore } from '@/stores/game/gameSession'

describe('GameView abandon dialog', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('opens in-app dialog on Abandon; does not call window.confirm', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')
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

    const wrapper = mount(GameView, {
      attachTo: document.body,
      global: {
        plugins: [pinia, router],
        stubs: {
          GameCanvasShell: { template: '<div data-testid="game-canvas-stub" />' },
          WinDebriefPanel: true,
        },
      },
    })
    await flushPromises()

    await wrapper.get('[data-testid="game-abandon-game"]').trigger('click')
    await flushPromises()

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(
      document.body.querySelector('[data-testid="memo-confirm-dialog"]'),
    ).toBeTruthy()

    wrapper.unmount()
  })

  it('cancel leaves session in progress and does not navigate', async () => {
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
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

    const session = useGameSessionStore()
    session.beginSession('easy')
    const finalizeSpy = vi.spyOn(session, 'finalizeSession')

    const wrapper = mount(GameView, {
      attachTo: document.body,
      global: {
        plugins: [pinia, router],
        stubs: {
          GameCanvasShell: { template: '<div data-testid="game-canvas-stub" />' },
          WinDebriefPanel: true,
        },
      },
    })
    await flushPromises()

    await wrapper.get('[data-testid="game-abandon-game"]').trigger('click')
    await flushPromises()
    ;(
      document.body.querySelector(
        '[data-testid="memo-confirm-cancel"]',
      ) as HTMLButtonElement
    ).click()
    await flushPromises()

    expect(finalizeSpy).not.toHaveBeenCalled()
    expect(pushSpy).not.toHaveBeenCalledWith({ name: 'briefcase' })
    expect(session.gameSession?.status).toBe('in_progress')
    expect(
      document.body.querySelector('[data-testid="memo-confirm-dialog"]'),
    ).toBeNull()

    wrapper.unmount()
  })

  it('confirm finalizes abandoned session and navigates to briefcase', async () => {
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
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

    const session = useGameSessionStore()
    session.beginSession('easy')
    const finalizeSpy = vi.spyOn(session, 'finalizeSession')
    const clearSpy = vi.spyOn(session, 'clearSession')
    const play = useGamePlayStore()
    const resetSpy = vi.spyOn(play, 'resetRound')

    const wrapper = mount(GameView, {
      attachTo: document.body,
      global: {
        plugins: [pinia, router],
        stubs: {
          GameCanvasShell: { template: '<div data-testid="game-canvas-stub" />' },
          WinDebriefPanel: true,
        },
      },
    })
    await flushPromises()

    await wrapper.get('[data-testid="game-abandon-game"]').trigger('click')
    await flushPromises()
    ;(
      document.body.querySelector(
        '[data-testid="memo-confirm-confirm"]',
      ) as HTMLButtonElement
    ).click()
    await flushPromises()

    expect(finalizeSpy).toHaveBeenCalledWith('abandoned')
    expect(resetSpy).toHaveBeenCalled()
    expect(clearSpy).toHaveBeenCalled()
    expect(session.gameSession).toBeNull()
    expect(pushSpy).toHaveBeenCalledWith({ name: 'briefcase' })

    wrapper.unmount()
  })
})
