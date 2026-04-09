import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { playUiClick } = vi.hoisted(() => ({ playUiClick: vi.fn() }))

vi.mock('@/audio/gameSfx', () => ({
  playUiClick,
}))

import BriefcaseView from '@/components/briefcase/BriefcaseView.vue'
import {
  briefcaseDescription,
  briefcaseDifficultyEasy,
  briefcaseDifficultyEasySubtitle,
  briefcaseDifficultyHard,
  briefcaseDifficultyHardSubtitle,
  briefcaseDifficultyLabel,
  briefcaseDifficultyMedium,
  briefcaseDifficultyMediumSubtitle,
  briefcaseSeedIncompleteMessage,
  briefcaseSeedLabel,
  briefcaseSeedPlaceholder,
  briefcaseTitle,
  briefcaseUnlockSameSettingsNewDeal,
  briefcaseUnlockShowcase,
  navReturnToGame,
  navReturnToStartScreen,
} from '@/constants/appCopy'
import { useGameSessionStore } from '@/stores/game/gameSession'
import { useGameSettingsStore } from '@/stores/game/gameSettings'

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
  setActivePinia(pinia)
  const router = createTestRouter()
  await router.push('/')
  await router.isReady()
  const wrapper = mount(BriefcaseView, { global: { plugins: [pinia, router] } })
  return { wrapper, router, pinia }
}

describe('BriefcaseView', () => {
  beforeEach(() => {
    playUiClick.mockClear()
  })

  it('renders English Main Menu title (h1), tagline, and difficulty heading', async () => {
    const { wrapper } = await mountBriefcase()
    const h1 = wrapper.get('h1')
    expect(h1.text()).toContain(briefcaseTitle)
    expect(wrapper.text()).toContain(briefcaseDescription)
    expect(wrapper.text()).toContain(briefcaseDifficultyLabel)
  })

  it('shows incomplete seed chrome only after blur (FR-005b)', async () => {
    const { wrapper } = await mountBriefcase()
    const input = wrapper.get('[data-testid="briefcase-seed-input"]')
    const unlock = wrapper.get('[data-testid="briefcase-unlock-showcase"]')
    await input.setValue('12')
    expect((unlock.element as HTMLButtonElement).disabled).toBe(false)
    expect(
      wrapper.find('[data-testid="briefcase-seed-incomplete-hint"]').exists(),
    ).toBe(false)
    await input.trigger('blur')
    expect((unlock.element as HTMLButtonElement).disabled).toBe(true)
    expect((input.element as HTMLInputElement).getAttribute('aria-invalid')).toBe(
      'true',
    )
    expect((input.element as HTMLInputElement).getAttribute('aria-describedby')).toBe(
      'briefcase-seed-incomplete-hint',
    )
    expect(wrapper.text()).toContain(briefcaseSeedIncompleteMessage)
    expect(
      wrapper.find('[data-testid="briefcase-seed-incomplete-hint"]').exists(),
    ).toBe(true)
    await input.setValue('123456789')
    expect((unlock.element as HTMLButtonElement).disabled).toBe(false)
    expect(
      wrapper.find('[data-testid="briefcase-seed-incomplete-hint"]').exists(),
    ).toBe(false)
  })

  it('masks nine-digit seed as xxx-xxx-xxx (005)', async () => {
    const { wrapper } = await mountBriefcase()
    const input = wrapper.get('[data-testid="briefcase-seed-input"]')
    await input.setValue('123456789')
    expect((input.element as HTMLInputElement).value).toBe('123-456-789')
    await input.setValue('000000000')
    expect((input.element as HTMLInputElement).value).toBe('000-000-000')
    await input.setValue('abc12def34ghi56jkl78mno9')
    expect((input.element as HTMLInputElement).value).toBe('123-456-789')
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
    expect((input.element as HTMLInputElement).value).toBe('42')
  })

  it('renders glass panel, difficulty radiogroup, and Unlock showcase (FR-010a–c)', async () => {
    const { wrapper, router } = await mountBriefcase()
    expect(wrapper.find('[data-testid="briefcase-glass-panel"]').exists()).toBe(true)
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

  it('plays UI click when difficulty selection changes (FR-005a)', async () => {
    const { wrapper } = await mountBriefcase()
    const settings = useGameSettingsStore()
    settings.difficulty = 'medium'
    await flushPromises()
    await wrapper.get('input[type="radio"][value="easy"]').setValue(true)
    expect(playUiClick).toHaveBeenCalledTimes(1)
  })

  it('does not navigate on Unlock when seed is incomplete before blur (composable guard)', async () => {
    const { wrapper, router } = await mountBriefcase()
    const input = wrapper.get('[data-testid="briefcase-seed-input"]')
    await input.setValue('12345678')
    await wrapper.get('[data-testid="briefcase-unlock-showcase"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('renders difficulty subtitles and seed placeholder (FR-010)', async () => {
    const { wrapper } = await mountBriefcase()
    expect(wrapper.text()).toContain(briefcaseDifficultyEasySubtitle)
    expect(wrapper.text()).toContain(briefcaseDifficultyMediumSubtitle)
    expect(wrapper.text()).toContain(briefcaseDifficultyHardSubtitle)
    const input = wrapper.get('[data-testid="briefcase-seed-input"]')
    expect(input.attributes('placeholder')).toBe(briefcaseSeedPlaceholder)
  })
})

describe('BriefcaseView unlock abandon confirm', () => {
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

  it('confirms abandon and navigates to game when hub difficulty mismatches in-progress session', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')
    const pinia = createPinia()
    setActivePinia(pinia)
    const session = useGameSessionStore()
    session.beginSession('easy')

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/', name: 'home', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')
    await router.isReady()

    const wrapper = mount(BriefcaseView, {
      attachTo: document.body,
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    await wrapper.get('[data-testid="briefcase-unlock-showcase"]').trigger('click')
    await flushPromises()

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(
      document.body.querySelector('[data-testid="memo-confirm-dialog"]'),
    ).toBeTruthy()
    ;(
      document.body.querySelector(
        '[data-testid="memo-confirm-confirm"]',
      ) as HTMLButtonElement
    ).click()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('game')
    expect(session.gameSession?.status).toBe('abandoned')
    wrapper.unmount()
  })

  it('cancels abandon and stays on briefcase when user dismisses confirm', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')
    const pinia = createPinia()
    setActivePinia(pinia)
    const session = useGameSessionStore()
    session.beginSession('easy')

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/', name: 'home', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')
    await router.isReady()

    const wrapper = mount(BriefcaseView, {
      attachTo: document.body,
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    await wrapper.get('[data-testid="briefcase-unlock-showcase"]').trigger('click')
    await flushPromises()

    expect(confirmSpy).not.toHaveBeenCalled()
    ;(
      document.body.querySelector(
        '[data-testid="memo-confirm-cancel"]',
      ) as HTMLButtonElement
    ).click()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('briefcase')
    expect(session.gameSession?.status).toBe('in_progress')
    wrapper.unmount()
  })

  it('shows same-settings copy when Unlock matches in-progress difficulty and seed', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const session = useGameSessionStore()
    const settings = useGameSettingsStore()
    settings.difficulty = 'easy'
    settings.briefcaseSeedRaw = '111-222-333'
    session.beginSession('easy', { dealBriefcaseSeedRaw: '111-222-333' })

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/', name: 'home', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')
    await router.isReady()

    const wrapper = mount(BriefcaseView, {
      attachTo: document.body,
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    await wrapper.get('[data-testid="briefcase-unlock-showcase"]').trigger('click')
    await flushPromises()

    const msg = document.body.querySelector('[data-testid="memo-confirm-message"]')
    expect(msg?.textContent).toContain(
      briefcaseUnlockSameSettingsNewDeal.slice(0, 40),
    )
    wrapper.unmount()
  })

  it('cancels Unlock when matching settings and user dismisses confirm', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const session = useGameSessionStore()
    const settings = useGameSettingsStore()
    settings.difficulty = 'easy'
    settings.briefcaseSeedRaw = '111-222-333'
    session.beginSession('easy', { dealBriefcaseSeedRaw: '111-222-333' })

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/', name: 'home', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')
    await router.isReady()

    const wrapper = mount(BriefcaseView, {
      attachTo: document.body,
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    await wrapper.get('[data-testid="briefcase-unlock-showcase"]').trigger('click')
    await flushPromises()
    ;(
      document.body.querySelector(
        '[data-testid="memo-confirm-cancel"]',
      ) as HTMLButtonElement
    ).click()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('briefcase')
    expect(session.gameSession?.status).toBe('in_progress')
    wrapper.unmount()
  })

  it('confirms Unlock and navigates to game when matching in-progress session', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const session = useGameSessionStore()
    const settings = useGameSettingsStore()
    settings.difficulty = 'easy'
    settings.briefcaseSeedRaw = '111-222-333'
    session.beginSession('easy', { dealBriefcaseSeedRaw: '111-222-333' })

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/', name: 'home', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')
    await router.isReady()

    const wrapper = mount(BriefcaseView, {
      attachTo: document.body,
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    await wrapper.get('[data-testid="briefcase-unlock-showcase"]').trigger('click')
    await flushPromises()
    ;(
      document.body.querySelector(
        '[data-testid="memo-confirm-confirm"]',
      ) as HTMLButtonElement
    ).click()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('game')
    expect(session.gameSession?.status).toBe('abandoned')
    wrapper.unmount()
  })
})

describe('BriefcaseView hub nav', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    })
  })

  it('Return to Start Screen navigates home when clicked', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/', name: 'home', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')
    await router.isReady()

    const wrapper = mount(BriefcaseView, {
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    await wrapper.get('[data-testid="briefcase-return-home"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('always shows Return to Start Screen', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/', name: 'home', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')

    const wrapper = mount(BriefcaseView, {
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    expect(wrapper.get('[data-testid="briefcase-return-home"]').text()).toContain(
      navReturnToStartScreen,
    )
    expect(wrapper.find('[data-testid="briefcase-return-game"]').exists()).toBe(false)
  })

  it('shows Return to Game when a match is in progress', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const session = useGameSessionStore()
    session.beginSession('easy')

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/briefcase', name: 'briefcase', component: { template: '<div/>' } },
        { path: '/', name: 'home', component: { template: '<div/>' } },
        { path: '/game', name: 'game', component: { template: '<div/>' } },
      ],
    })
    await router.push('/briefcase')

    const wrapper = mount(BriefcaseView, {
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    expect(wrapper.get('[data-testid="briefcase-return-game"]').text()).toContain(
      navReturnToGame,
    )
  })
})
