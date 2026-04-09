const MAX_DIGITS = 9

/**
 * Normalize raw input to at most nine digits, then format as `xxx-xxx-xxx`.
 */
export function formatMaskedNineDigitsFromRawInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, MAX_DIGITS)
  if (digits.length <= 3) {
    return digits
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}
