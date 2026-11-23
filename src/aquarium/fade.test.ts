import { describe, expect, test } from 'vitest'
import { boxHitsAny, easeVeil, fishBox, fishLength, VEIL_MIN, VEIL_S, type Fish } from './fish'

const fish = (x: number, y: number): Fish => ({ x, y, depth: 0.2, speed: 60, phase: 0, scale: 1 })

describe('whole-sprite fade (veil)', () => {
  test('fades down to VEIL_MIN over about 300 ms, in steps, not at once', () => {
    expect(VEIL_MIN).toBeGreaterThanOrEqual(0.2)
    expect(VEIL_MIN).toBeLessThanOrEqual(0.3)
    expect(VEIL_S).toBeCloseTo(0.3)
    let v = 1
    v = easeVeil(v, VEIL_MIN, 0.1)
    expect(v).toBeLessThan(1)
    expect(v).toBeGreaterThan(VEIL_MIN)
    v = easeVeil(v, VEIL_MIN, 0.1)
    v = easeVeil(v, VEIL_MIN, 0.1)
    expect(v).toBeCloseTo(VEIL_MIN)
  })

  test('restores to full the same way and never overshoots', () => {
    let v = VEIL_MIN
    for (let i = 0; i < 10; i++) v = easeVeil(v, 1, 0.05)
    expect(v).toBe(1)
    expect(easeVeil(1, 1, 0.1)).toBe(1)
    expect(easeVeil(VEIL_MIN, VEIL_MIN, 0.1)).toBe(VEIL_MIN)
  })

  test('an infinite step snaps straight to the target (used for reduced motion)', () => {
    expect(easeVeil(1, VEIL_MIN, Infinity)).toBe(VEIL_MIN)
    expect(easeVeil(VEIL_MIN, 1, Infinity)).toBe(1)
  })
})

describe('overlap boxes', () => {
  test('the fish box covers the whole fish, nose to tail', () => {
    const f = fish(500, 300)
    const b = fishBox(f)
    expect(b.right).toBeGreaterThanOrEqual(500)
    expect(b.left).toBeLessThanOrEqual(500 - fishLength(f))
    expect(b.top).toBeLessThan(300)
    expect(b.bottom).toBeGreaterThan(300)
  })

  test('boxHitsAny is true only for a real overlap', () => {
    const button = { left: 100, top: 100, right: 200, bottom: 140 }
    expect(boxHitsAny({ left: 150, top: 120, right: 260, bottom: 160 }, [button])).toBe(true)
    expect(boxHitsAny({ left: 201, top: 120, right: 260, bottom: 160 }, [button])).toBe(false)
    expect(boxHitsAny({ left: 150, top: 141, right: 260, bottom: 160 }, [button])).toBe(false)
    expect(boxHitsAny({ left: 0, top: 0, right: 10, bottom: 10 }, [])).toBe(false)
  })
})
