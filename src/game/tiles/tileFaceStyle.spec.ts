import { describe, expect, it } from 'vitest'
import {
  faceGradientStopsForEntry,
  GOLD_FACE_STOPS,
  parseHexColor,
} from '@/game/tiles/tileFaceStyle'

describe('tileFaceStyle', () => {
  it('parses 6-digit hex', () => {
    expect(parseHexColor('#eb4b4b')).toEqual({ r: 235, g: 75, b: 75 })
  })

  it('uses gold stops for Covert', () => {
    const g = faceGradientStopsForEntry('#eb4b4b', 'Covert')
    expect(g.start).toBe(GOLD_FACE_STOPS.light)
    expect(g.end).toBe(GOLD_FACE_STOPS.dark)
  })

  it('derives gradient from catalog color for non-top tier', () => {
    const g = faceGradientStopsForEntry('#4b69ff', 'Mil-Spec Grade')
    expect(g.start).toContain('rgb')
    expect(g.end).toContain('rgb')
    expect(g.start).not.toBe(GOLD_FACE_STOPS.light)
  })
})
