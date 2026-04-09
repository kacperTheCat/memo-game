import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AppButton from './AppButton.vue'

const { playUiClick } = vi.hoisted(() => ({
  playUiClick: vi.fn(),
}))

vi.mock('@/audio/gameSfx', () => ({
  playUiClick,
}))

describe('AppButton', () => {
  beforeEach(() => {
    playUiClick.mockClear()
  })
  it('applies shared theme utility classes for nav links', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/game', component: { template: '<div />' } },
      ],
    })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(AppButton, {
      props: { to: '/game' },
      attrs: { 'data-testid': 'nav-to-game' },
      global: { plugins: [router] },
      slots: { default: 'Play' },
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    const cls = link.classes().join(' ')
    expect(cls).toMatch(/border-memo-border/)
    expect(cls).toMatch(/bg-memo-surface/)
    expect(cls).toMatch(/theme-nav-link/)
  })

  it('plays UI click on RouterLink activation', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/game', component: { template: '<div />' } },
      ],
    })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(AppButton, {
      props: { to: '/game' },
      global: { plugins: [router] },
      slots: { default: 'Play' },
    })
    await wrapper.find('a').trigger('click')
    expect(playUiClick).toHaveBeenCalledTimes(1)
  })

  it('plays UI click on native button activation', async () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'OK' },
    })
    await wrapper.find('button').trigger('click')
    expect(playUiClick).toHaveBeenCalledTimes(1)
  })

  it('does not play UI click when button is disabled', async () => {
    const wrapper = mount(AppButton, {
      props: { disabled: true },
      slots: { default: 'OK' },
    })
    await wrapper.find('button').trigger('click')
    expect(playUiClick).not.toHaveBeenCalled()
  })
})
