import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GameCanvasShell from './GameCanvasShell.vue'
import { useGameSettingsStore } from '@/stores/gameSettings'

describe('GameCanvasShell', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () =>
        ({
          scale: vi.fn(),
          setTransform: vi.fn(),
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          strokeRect: vi.fn(),
          drawImage: vi.fn(),
        }) as unknown as CanvasRenderingContext2D,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exposes grid meta matching buildGridLayout for hard', async () => {
    const pinia = createPinia()
    const store = useGameSettingsStore(pinia)
    store.difficulty = 'hard'
    const wrapper = mount(GameCanvasShell, { global: { plugins: [pinia] } })
    await flushPromises()
    const meta = wrapper.get('[data-testid="game-grid-meta"]')
    expect(meta.attributes('data-rows')).toBe('8')
    expect(meta.attributes('data-cols')).toBe('8')
    expect(meta.attributes('data-cells')).toBe('64')
  })

  it('exposes grid meta for easy (4×4, 16 cells)', async () => {
    const pinia = createPinia()
    const store = useGameSettingsStore(pinia)
    store.difficulty = 'easy'
    const wrapper = mount(GameCanvasShell, { global: { plugins: [pinia] } })
    await flushPromises()
    const meta = wrapper.get('[data-testid="game-grid-meta"]')
    expect(meta.attributes('data-rows')).toBe('4')
    expect(meta.attributes('data-cols')).toBe('4')
    expect(meta.attributes('data-cells')).toBe('16')
  })

  it('mounts canvas element', () => {
    const pinia = createPinia()
    const wrapper = mount(GameCanvasShell, { global: { plugins: [pinia] } })
    expect(wrapper.get('[data-testid="game-canvas"]').exists()).toBe(true)
  })
})
