import { mount, type DOMWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import MemoSecondaryNavButton from '@/components/ui/MemoSecondaryNavButton.vue'

function expectMaterialIcon(
  root: DOMWrapper<Element>,
  expected: { glyph: string; hoverMotion: '-translate-x-1' | 'translate-x-1' | null },
): void {
  const span = root.find('.material-symbols-outlined')
  expect(span.exists()).toBe(true)
  expect(span.text().trim()).toBe(expected.glyph)
  expect(span.attributes('aria-hidden')).toBe('true')
  const cls = span.classes()
  if (expected.hoverMotion === '-translate-x-1') {
    expect(cls).toContain('group-hover:-translate-x-1')
    expect(cls).toContain('mr-2')
  } else if (expected.hoverMotion === 'translate-x-1') {
    expect(cls).toContain('group-hover:translate-x-1')
  } else {
    expect(cls).not.toContain('group-hover:-translate-x-1')
    expect(cls).not.toContain('group-hover:translate-x-1')
    expect(cls).toContain('mr-2')
  }
}

describe('MemoSecondaryNavButton', () => {
  it('renders back variant with Material icon, group root, and label', () => {
    const wrapper = mount(MemoSecondaryNavButton, {
      props: {
        variant: 'back',
        label: 'Return',
        dataTestid: 'nav-test',
      },
    })
    const root = wrapper.get('[data-testid="nav-test"]')
    expect(root.classes()).toContain('group')
    expectMaterialIcon(root, { glyph: 'arrow_back', hoverMotion: '-translate-x-1' })
    expect(root.text()).toContain('Return')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('renders forward variant with label before arrow_forward and right hover motion', () => {
    const wrapper = mount(MemoSecondaryNavButton, {
      props: {
        variant: 'forward',
        label: 'Resume',
        dataTestid: 'fwd-test',
      },
    })
    const root = wrapper.get('[data-testid="fwd-test"]')
    expect(root.classes()).toContain('group')
    expectMaterialIcon(root, { glyph: 'arrow_forward', hoverMotion: 'translate-x-1' })
    const flat = root.text().replace(/\s+/g, ' ').trim()
    expect(flat.indexOf('Resume')).toBeLessThan(flat.indexOf('arrow_forward'))
    expect(root.find('.material-symbols-outlined').classes()).toContain('ml-2')
  })

  it('renders dismiss variant with close glyph (no horizontal hover slide)', () => {
    const wrapper = mount(MemoSecondaryNavButton, {
      props: {
        variant: 'dismiss',
        label: 'Abandon',
        dataTestid: 'abandon-test',
      },
    })
    const root = wrapper.get('[data-testid="abandon-test"]')
    expect(root.classes()).toContain('group')
    expectMaterialIcon(root, { glyph: 'close', hoverMotion: null })
    expect(root.text()).toContain('Abandon')
  })

  it('emits click for button mode', async () => {
    const wrapper = mount(MemoSecondaryNavButton, {
      props: { variant: 'back', label: 'Tap', dataTestid: 'b' },
    })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('renders RouterLink when `to` is set', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'home', component: { template: '<div/>' } }],
    })
    const wrapper = mount(MemoSecondaryNavButton, {
      props: {
        variant: 'back',
        label: 'Home',
        to: { name: 'home' },
        dataTestid: 'link-test',
      },
      global: { plugins: [router] },
    })
    expect(wrapper.findComponent({ name: 'RouterLink' }).exists()).toBe(true)
    const root = wrapper.get('[data-testid="link-test"]')
    expect(root.find('.material-symbols-outlined').exists()).toBe(true)
    expect(root.find('.material-symbols-outlined').text().trim()).toBe('arrow_back')
  })
})
