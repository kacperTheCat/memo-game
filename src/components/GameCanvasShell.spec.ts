import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import GameCanvasShell from './GameCanvasShell.vue'
import { STORAGE_IN_PROGRESS_KEY } from '@/game/sessionConstants'
import { useGameSettingsStore } from '@/stores/gameSettings'

function createShellRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/game', name: 'game', component: { template: '<div />' } }],
  })
}

describe('GameCanvasShell', () => {
  beforeEach(() => {
    const ls = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => (ls.has(k) ? ls.get(k)! : null),
      setItem: (k: string, v: string) => void ls.set(k, v),
      removeItem: (k: string) => void ls.delete(k),
    })
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001')
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () =>
        ({
          scale: vi.fn(),
          setTransform: vi.fn(),
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          strokeRect: vi.fn(),
          drawImage: vi.fn(),
          createLinearGradient: () => ({ addColorStop: vi.fn() }),
          beginPath: vi.fn(),
          rect: vi.fn(),
          clip: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
        }) as unknown as CanvasRenderingContext2D,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exposes grid meta matching buildGridLayout for hard', async () => {
    const pinia = createPinia()
    const router = createShellRouter()
    await router.push('/game')
    await router.isReady()
    const store = useGameSettingsStore(pinia)
    store.difficulty = 'hard'
    const wrapper = mount(GameCanvasShell, {
      global: { plugins: [pinia, router] },
    })
    await flushPromises()
    const meta = wrapper.get('[data-testid="game-grid-meta"]')
    expect(meta.attributes('data-rows')).toBe('8')
    expect(meta.attributes('data-cols')).toBe('8')
    expect(meta.attributes('data-cells')).toBe('64')
  })

  it('exposes grid meta for easy (4×4, 16 cells)', async () => {
    const pinia = createPinia()
    const router = createShellRouter()
    await router.push('/game')
    await router.isReady()
    const store = useGameSettingsStore(pinia)
    store.difficulty = 'easy'
    const wrapper = mount(GameCanvasShell, {
      global: { plugins: [pinia, router] },
    })
    await flushPromises()
    const meta = wrapper.get('[data-testid="game-grid-meta"]')
    expect(meta.attributes('data-rows')).toBe('4')
    expect(meta.attributes('data-cols')).toBe('4')
    expect(meta.attributes('data-cells')).toBe('16')
  })

  it('mounts canvas element', async () => {
    const pinia = createPinia()
    const router = createShellRouter()
    await router.push('/game')
    await router.isReady()
    const wrapper = mount(GameCanvasShell, {
      global: { plugins: [pinia, router] },
    })
    expect(wrapper.get('[data-testid="game-canvas"]').exists()).toBe(true)
  })

  it('dev debug peek toggles aria-pressed and repaints', async () => {
    if (!import.meta.env.DEV) {
      return
    }
    const pinia = createPinia()
    const router = createShellRouter()
    await router.push('/game')
    await router.isReady()
    const wrapper = mount(GameCanvasShell, {
      global: { plugins: [pinia, router] },
    })
    await flushPromises()
    const btn = wrapper.get('[data-testid="game-debug-peek-faces"]')
    expect(btn.attributes('aria-pressed')).toBe('false')
    await btn.trigger('click')
    expect(btn.attributes('aria-pressed')).toBe('true')
    await btn.trigger('click')
    expect(btn.attributes('aria-pressed')).toBe('false')
  })

  it('syncs settings difficulty from easy in-progress snapshot (refresh parity)', async () => {
    const cells = Array.from({ length: 16 }, (_, i) => ({
      identityIndex: i % 8,
      phase: 'concealed' as const,
    }))
    const snap = {
      schemaVersion: 1,
      session: {
        sessionId: 'snap-easy',
        difficulty: 'easy' as const,
        dealBriefcaseSeedRaw: '',
        clickCount: 0,
        activePlayMs: 0,
        startedAt: '2026-01-01T00:00:00.000Z',
        completedAt: null,
        status: 'in_progress' as const,
      },
      cells,
      pair: { firstIndex: null, secondIndex: null, locked: false },
    }
    localStorage.setItem(STORAGE_IN_PROGRESS_KEY, JSON.stringify(snap))

    const pinia = createPinia()
    const router = createShellRouter()
    await router.push('/game')
    await router.isReady()
    const store = useGameSettingsStore(pinia)
    store.difficulty = 'medium'
    const wrapper = mount(GameCanvasShell, {
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    expect(store.difficulty).toBe('easy')
    const meta = wrapper.get('[data-testid="game-grid-meta"]')
    expect(meta.attributes('data-rows')).toBe('4')
    expect(meta.attributes('data-cols')).toBe('4')
    expect(meta.attributes('data-cells')).toBe('16')
  })
})
