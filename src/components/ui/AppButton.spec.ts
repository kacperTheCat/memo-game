import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import AppButton from './AppButton.vue'

describe('AppButton', () => {
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
})
