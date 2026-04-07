import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GameCanvasShell from './GameCanvasShell.vue'

describe('GameCanvasShell', () => {
  it('mounts a canvas with configured dimensions', () => {
    const w = 320
    const h = 240
    const wrapper = mount(GameCanvasShell, {
      props: { width: w, height: h },
    })
    const canvas = wrapper.find('canvas')
    expect(canvas.exists()).toBe(true)
    expect(canvas.attributes('width')).toBe(String(w))
    expect(canvas.attributes('height')).toBe(String(h))
  })
})
