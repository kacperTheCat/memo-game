import { describe, expect, it } from 'vitest'
import { documentTitle, primaryHeading } from './appCopy'

describe('appCopy', () => {
  it('exports non-empty English strings', () => {
    expect(primaryHeading.length).toBeGreaterThan(0)
    expect(documentTitle.length).toBeGreaterThan(0)
    expect(primaryHeading).toMatch(/^[\x20-\x7E]+$/)
    expect(documentTitle).toMatch(/^[\x20-\x7E]+$/)
  })
})
