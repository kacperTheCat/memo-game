import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import BriefcaseView from './BriefcaseView.vue'
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
})
