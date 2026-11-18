import { describe, expect, test } from 'vitest'
import { ditherCells } from './dither'
import { flipState } from './flip'
import { paletteAt, TO_DARK } from './palette'
import { hash2, levelOf } from './shimmer'

describe('tile engine', () => {
  test('dither levels light 3, 6, 10, 13, 16 cells', () =>
    expect([0, 1, 2, 3, 4].map(l => ditherCells(l).length)).toEqual([3, 6, 10, 13, 16]))
  test('flip is flat before the front and done after it', () => {
    expect(flipState(10, 0, 0, 2.2).k).toBe(0)
    expect(flipState(0, 10, 0, 2.2).k).toBe(1)
  })
  test('flip is edge-on and brightest halfway', () => {
    const s = flipState(0, 1.1, 0, 2.2)
    expect(s.squash).toBeCloseTo(0, 5); expect(s.turn).toBeCloseTo(1, 5)
  })
  test('paletteAt wraps', () => expect(paletteAt(TO_DARK, 1)).toEqual(paletteAt(TO_DARK, 0)))
  test('levelOf clamps to 4', () => expect(levelOf(1)).toBe(4))
  test('hash2 is stable and in range', () => { const v = hash2(3, 7); expect(v).toBe(hash2(3, 7)); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1) })
})
