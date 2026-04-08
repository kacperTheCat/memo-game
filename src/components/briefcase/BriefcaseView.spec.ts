import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import BriefcaseView from './BriefcaseView.vue'
import { useGameSettingsStore } from '@/stores/gameSettings'
import { useGameSessionStore } from '@/stores/gameSession'
import {
  briefcaseDescription,
  briefcaseDifficultyEasy,
  briefcaseDifficultyHard,
  briefcaseDifficultyLabel,
  briefcaseDifficultyMedium,
  briefcaseSeedLabel,
  briefcaseTitle,
  briefcaseUnlockShowcase,
} from '@/constants/appCopy'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/game', name: 'game', component: { template: '<div />' } },
      { path: '/briefcase', name: 'briefcase', component: { template: '<div />' } },
    ],
  })
}

async function mountBriefcase() {
  const pinia = createPinia()
  const router = createTestRouter()
  await router.push('/')
  await router.isReady()
  const wrapper = mount(BriefcaseView, { global: { plugins: [pinia, router] } })
  return { wrapper, router }
}

describe('BriefcaseView', () => {
  it('renders English Main Menu title (h1), tagline, and difficulty heading', async () => {
    const { wrapper } = await mountBriefcase()
    const h1 = wrapper.get('h1')
    expect(h1.text()).toContain(briefcaseTitle)
    expect(wrapper.text()).toContain(briefcaseDescription)
    expect(wrapper.text()).toContain(briefcaseDifficultyLabel)
  })

  it('uses only ASCII-visible copy in key strings (English UI sample)', () => {
    const ascii = /^[\t\n\r\x20-\x7E]+$/
    expect(briefcaseTitle).toMatch(ascii)
    expect(briefcaseDescription).toMatch(ascii)
  })

  it('renders Main Menu seed input with English label (FR-010d)', async () => {
    const { wrapper } = await mountBriefcase()
    expect(wrapper.text()).toContain(briefcaseSeedLabel)
    const input = wrapper.get('[data-testid="briefcase-seed-input"]')
    expect(input.attributes('type')).toBe('text')
    await input.setValue('test-seed-42')
    expect((input.element as HTMLInputElement).value).toBe('test-seed-42')
  })

  it('renders glass panel, difficulty radiogroup, and Unlock showcase (FR-010a–c)', async () => {
    const { wrapper, router } = await mountBriefcase()
    expect(wrapper.get('[data-testid="briefcase-glass-panel"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(briefcaseDifficultyLabel)
    expect(wrapper.text()).toContain(briefcaseDifficultyEasy)
    expect(wrapper.text()).toContain(briefcaseDifficultyMedium)
    expect(wrapper.text()).toContain(briefcaseDifficultyHard)
    expect(wrapper.text()).toContain(briefcaseUnlockShowcase)

    const group = wrapper.get('[data-testid="briefcase-difficulty"]')
    expect(group.element.tagName).toBe('FIELDSET')
    expect(group.find('legend').text()).toContain(briefcaseDifficultyLabel)
    expect(wrapper.find('select').exists()).toBe(false)

    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(3)
    const values = radios.map((r) => (r.element as HTMLInputElement).value).sort()
    expect(values).toEqual(['easy', 'hard', 'medium'])
    const names = new Set(radios.map((r) => (r.element as HTMLInputElement).name))
    expect(names.size).toBe(1)

    const medium = radios.find((r) => (r.element as HTMLInputElement).value === 'medium')!
    const hard = radios.find((r) => (r.element as HTMLInputElement).value === 'hard')!
    expect((medium.element as HTMLInputElement).checked).toBe(true)

    await hard.setValue(true)
    expect((hard.element as HTMLInputElement).checked).toBe(true)
    expect((medium.element as HTMLInputElement).checked).toBe(false)

    await wrapper.get('[data-testid="briefcase-unlock-showcase"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('game')
  })

  describe('FR-014: difficulty as next-start parameter', () => {
    beforeEach(() => {
      vi.spyOn(crypto, 'randomUUID').mockReturnValue(
        '00000000-0000-4000-8000-000000000099',
      )
      const ls = new Map<string, string>()
      vi.stubGlobal('localStorage', {
        getItem: (k: string) => (ls.has(k) ? ls.get(k)! : null),
        setItem: (k: string, v: string) => void ls.set(k, v),
        removeItem: (k: string) => void ls.delete(k),
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('does not prompt when changing difficulty radios during in_progress', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm')
      const pinia = createPinia()
      const session = useGameSessionStore(pinia)
      session.beginSession('medium')
      const settings = useGameSettingsStore(pinia)
      settings.difficulty = 'medium'

      const { wrapper } = await mountBriefcaseWithPinia(pinia)
      const hard = wrapper
        .findAll('input[type="radio"]')
        .find((r) => (r.element as HTMLInputElement).value === 'hard')!
      await hard.setValue(true)
      await flushPromises()

      expect(settings.difficulty).toBe('hard')
      expect(session.gameSession?.status).toBe('in_progress')
      expect(confirmSpy).not.toHaveBeenCalled()
    })

    it('prompts on Unlock when selected difficulty mismatches in_progress session; cancel skips navigation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      const pinia = createPinia()
      const session = useGameSessionStore(pinia)
      session.beginSession('medium')
      const settings = useGameSettingsStore(pinia)
      settings.difficulty = 'hard'

      const { wrapper, router } = await mountBriefcaseWithPinia(pinia)
      const pushSpy = vi.spyOn(router, 'push')

      await wrapper.get('[data-testid="briefcase-unlock-showcase"]').trigger('click')
      await flushPromises()

      expect(confirmSpy).toHaveBeenCalledOnce()
      expect(session.gameSession?.status).toBe('in_progress')
      expect(pushSpy).not.toHaveBeenCalled()
    })

    it('Unlock confirm abandons and navigates when user accepts', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const pinia = createPinia()
      const session = useGameSessionStore(pinia)
      session.beginSession('medium')
      const settings = useGameSettingsStore(pinia)
      settings.difficulty = 'easy'

      const { wrapper, router } = await mountBriefcaseWithPinia(pinia)
      const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

      await wrapper.get('[data-testid="briefcase-unlock-showcase"]').trigger('click')
      await flushPromises()

      expect(session.gameSession?.status).toBe('abandoned')
      expect(pushSpy).toHaveBeenCalledWith({ name: 'game' })
    })
  })
})

async function mountBriefcaseWithPinia(pinia: ReturnType<typeof createPinia>) {
  const router = createTestRouter()
  await router.push('/')
  await router.isReady()
  const wrapper = mount(BriefcaseView, { global: { plugins: [pinia, router] } })
  return { wrapper, router }
}
