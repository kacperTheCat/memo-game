import { defineComponent } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type BriefcaseRequestConfirm,
  useBriefcaseNavigateToGame,
} from '@/composables/useBriefcaseNavigateToGame'
import {
  briefcaseUnlockAbandonInProgress,
  briefcaseUnlockSameSettingsNewDeal,
} from '@/constants/appCopy'
import { useGamePlayStore } from '@/stores/gamePlay'
import { useGameSessionStore } from '@/stores/gameSession'
import { useGameSettingsStore } from '@/stores/gameSettings'

function mountHarness(
  requestConfirm: BriefcaseRequestConfirm,
  plugins: ReturnType<typeof createPinia>[],
) {
  const Comp = defineComponent({
    setup() {
      const { navigateToGame } = useBriefcaseNavigateToGame(requestConfirm)
      return { navigateToGame }
    },
    template:
      '<button type="button" data-testid="nav-go" @click="navigateToGame()">go</button>',
  })
  return mount(Comp, { global: { plugins } })
}

describe('useBriefcaseNavigateToGame', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
  })

  it('does not router.push when requestConfirm resolves false on mismatch', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')
    await router.isReady()
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

    const session = useGameSessionStore()
    session.beginSession('easy')
    const settings = useGameSettingsStore()
    settings.difficulty = 'hard'

    const requestConfirm = vi
      .fn<BriefcaseRequestConfirm>()
      .mockResolvedValue(false)

    const wrapper = mountHarness(requestConfirm, [pinia, router])
    await wrapper.get('[data-testid="nav-go"]').trigger('click')
    await flushPromises()

    expect(requestConfirm).toHaveBeenCalledWith(briefcaseUnlockAbandonInProgress)
    expect(pushSpy).not.toHaveBeenCalled()
    expect(session.gameSession?.status).toBe('in_progress')
    wrapper.unmount()
  })

  it('finalizeSession and router.push when requestConfirm resolves true on mismatch', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')
    await router.isReady()
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

    const session = useGameSessionStore()
    session.beginSession('easy')
    const settings = useGameSettingsStore()
    settings.difficulty = 'hard'
    const play = useGamePlayStore()
    const finalizeSpy = vi.spyOn(session, 'finalizeSession')
    const resetSpy = vi.spyOn(play, 'resetRound')

    const requestConfirm = vi
      .fn<BriefcaseRequestConfirm>()
      .mockResolvedValue(true)

    const wrapper = mountHarness(requestConfirm, [pinia, router])
    await wrapper.get('[data-testid="nav-go"]').trigger('click')
    await flushPromises()

    expect(finalizeSpy).toHaveBeenCalledWith('abandoned')
    expect(resetSpy).toHaveBeenCalled()
    expect(pushSpy).toHaveBeenCalledWith({
      name: 'game',
      state: { memoDealInit: { seedNine: null } },
    })
    wrapper.unmount()
  })

  it('does not call requestConfirm when there is no in-progress session', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')
    await router.isReady()
    vi.spyOn(router, 'push').mockResolvedValue(undefined)

    const settings = useGameSettingsStore()
    settings.difficulty = 'medium'

    const requestConfirm = vi.fn<BriefcaseRequestConfirm>().mockResolvedValue(true)

    const wrapper = mountHarness(requestConfirm, [pinia, router])
    await wrapper.get('[data-testid="nav-go"]').trigger('click')
    await flushPromises()

    expect(requestConfirm).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('calls requestConfirm with same-settings copy when in progress matches Briefcase', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')
    await router.isReady()
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

    const session = useGameSessionStore()
    const settings = useGameSettingsStore()
    settings.difficulty = 'easy'
    settings.briefcaseSeedRaw = '111-222-333'
    session.beginSession('easy', { dealBriefcaseSeedRaw: '111-222-333' })

    const requestConfirm = vi
      .fn<BriefcaseRequestConfirm>()
      .mockResolvedValue(false)

    const wrapper = mountHarness(requestConfirm, [pinia, router])
    await wrapper.get('[data-testid="nav-go"]').trigger('click')
    await flushPromises()

    expect(requestConfirm).toHaveBeenCalledWith(briefcaseUnlockSameSettingsNewDeal)
    expect(pushSpy).not.toHaveBeenCalled()
    expect(session.gameSession?.status).toBe('in_progress')
    wrapper.unmount()
  })

  it('finalizeSession and router.push when requestConfirm resolves true with matching settings', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')
    await router.isReady()
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

    const session = useGameSessionStore()
    const settings = useGameSettingsStore()
    settings.difficulty = 'easy'
    settings.briefcaseSeedRaw = '111-222-333'
    session.beginSession('easy', { dealBriefcaseSeedRaw: '111-222-333' })
    const play = useGamePlayStore()
    const finalizeSpy = vi.spyOn(session, 'finalizeSession')
    const resetSpy = vi.spyOn(play, 'resetRound')

    const requestConfirm = vi
      .fn<BriefcaseRequestConfirm>()
      .mockResolvedValue(true)

    const wrapper = mountHarness(requestConfirm, [pinia, router])
    await wrapper.get('[data-testid="nav-go"]').trigger('click')
    await flushPromises()

    expect(requestConfirm).toHaveBeenCalledWith(briefcaseUnlockSameSettingsNewDeal)
    expect(finalizeSpy).toHaveBeenCalledWith('abandoned')
    expect(resetSpy).toHaveBeenCalled()
    expect(pushSpy).toHaveBeenCalledWith({
      name: 'game',
      state: { memoDealInit: { seedNine: '111222333' } },
    })
    wrapper.unmount()
  })
})
