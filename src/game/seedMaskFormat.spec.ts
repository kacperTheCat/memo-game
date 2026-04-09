import { describe, expect, it } from 'vitest'
import { formatMaskedNineDigitsFromRawInput } from '@/game/seedMaskFormat'

describe('formatMaskedNineDigitsFromRawInput', () => {
  it('caps digit run at nine (typing path)', () => {
    const nine = '123456789'
    expect(formatMaskedNineDigitsFromRawInput(`${nine}0`)).toBe('123-456-789')
    expect(formatMaskedNineDigitsFromRawInput(`${nine}99`)).toBe('123-456-789')
  })

  it('truncates long digit-only paste to first nine', () => {
    expect(formatMaskedNineDigitsFromRawInput('12345678901234')).toBe('123-456-789')
  })
})
