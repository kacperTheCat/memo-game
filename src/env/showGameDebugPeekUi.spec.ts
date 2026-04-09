import { describe, expect, it } from 'vitest'
import { isLoopbackHostname, showGameDebugPeekUi } from './showGameDebugPeekUi'

describe('isLoopbackHostname', () => {
  it.each([
    ['localhost', true],
    ['LOCALHOST', true],
    ['LocalHost', true],
    ['127.0.0.1', true],
    ['[::1]', true],
    ['  localhost  ', true],
  ])('treats %s as loopback', (host, expected) => {
    expect(isLoopbackHostname(host)).toBe(expected)
  })

  it.each([
    ['example.com', false],
    ['192.168.1.1', false],
    ['10.0.0.1', false],
    ['my-preview.vercel.app', false],
    ['', false],
  ])('treats %s as non-loopback', (host, expected) => {
    expect(isLoopbackHostname(host)).toBe(expected)
  })
})

describe('showGameDebugPeekUi', () => {
  it('matches DEV flag and loopback hostname', () => {
    const dev = import.meta.env.DEV
    const host = typeof window !== 'undefined' ? window.location.hostname : ''
    const expected = dev && isLoopbackHostname(host)
    expect(showGameDebugPeekUi()).toBe(expected)
  })
})
