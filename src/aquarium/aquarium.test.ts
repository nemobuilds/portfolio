import { describe, expect, test } from 'vitest'
import { seeded } from './rng'
import { fogged, mix } from './color'
import { CELL, clownfishAlpha, fishCount, makeFish, respawn, separate, type Fish } from './fish'
import { sideClassify } from './sideFish'
import { initialAngler, stepAngler } from './angler'
import { buildSeabed, SEABED_ROWS } from './seabed'

const fishAt = (x: number, y: number, depth: number): Fish => ({ x, y, depth, speed: 60, phase: 0, scale: 1 })

describe('fish', () => {
  test('fishCount never exceeds 4 and is 2 on phones', () => {
    expect(fishCount(390, 844)).toBe(2)
    expect(fishCount(759, 5000)).toBe(2)
    expect(fishCount(2560, 1440)).toBeLessThanOrEqual(4)
    expect(fishCount(1024, 600)).toBeGreaterThanOrEqual(3)
    expect(fishCount(7680, 4320)).toBe(4)
  })

  test('respawn re-enters left of the screen at the emptiest height', () => {
    const bounds = { width: 1000, height: 1000 }
    const f = fishAt(900, 500, 0.3)
    const others = [fishAt(0, 120, 0.3), fishAt(0, 330, 0.3)]
    // candidate heights: 120, 330, 540, 750, 960
    const seq = [0, 0.25, 0.5, 0.75, 1]
    let i = 0
    respawn(f, [f, ...others], bounds, () => seq[i++])
    expect(f.x).toBeLessThan(0)
    expect(f.y).toBeCloseTo(960)
  })

  test('separate pushes apart fish at similar depth only', () => {
    const a = fishAt(500, 400, 0.1)
    const b = fishAt(500, 410, 0.15)
    const farA = fishAt(500, 400, 0.1)
    const farB = fishAt(500, 410, 0.9)
    separate([a, b], 0.1)
    separate([farA, farB], 0.1)
    expect(Math.abs(b.y - a.y)).toBeGreaterThan(10)
    expect(farA.y).toBe(400)
    expect(farB.y).toBe(410)
    expect(farA.x).toBe(500)
  })

  test('far fish are slower', () => {
    const bounds = { width: 800, height: 600 }
    const near = makeFish(seeded(4), bounds, 0)
    const far = makeFish(seeded(4), bounds, 1)
    expect(far.speed / near.speed).toBeCloseTo(0.58, 5)
    expect(far.scale / near.scale).toBeCloseTo(0.62, 5)
    expect(CELL).toBe(14)
  })

  test('clownfishAlpha fades between 0.42 and 0.62', () => {
    expect(clownfishAlpha(0.3)).toBe(1)
    expect(clownfishAlpha(0.52)).toBeCloseTo(0.5)
    expect(clownfishAlpha(0.7)).toBe(0)
  })
})

describe('color', () => {
  test('mix blends two colours', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('rgb(128,128,128)')
  })
  test('fogged at depth 1 is 70% toward the water', () => {
    expect(fogged('#000000', 'rgb(100,200,250)', 1)).toBe('rgb(70,140,175)')
  })
})

describe('sideClassify', () => {
  test('side fish has three white bands', () => {
    let runs = 0
    let prev: string | null = null
    for (let u = 1; u >= 0; u -= 0.002) {
      const c = sideClassify(u, 0, 0, 0)
      if (c === 'band' && prev !== 'band') runs++
      prev = c
    }
    expect(runs).toBe(3)
  })
})

describe('angler', () => {
  test('first rises 2 s after reaching the deep', () => {
    const rng = seeded(1)
    expect(stepAngler(initialAngler(), 1.9, true, rng).phase).toBe('hidden')
    expect(stepAngler(initialAngler(), 2.1, true, rng).phase).toBe('rising')
  })
  test('stays hidden when not deep', () => {
    const s = stepAngler(initialAngler(), 30, false, seeded(1))
    expect(s.phase).toBe('hidden')
    expect(s.timer).toBe(2)
  })
  test('runs the full cycle and waits 3-6 s before the next rise', () => {
    const rng = seeded(2)
    let s = stepAngler(initialAngler(), 2.1, true, rng)
    s = stepAngler(s, 1.9, true, rng)
    expect(s.phase).toBe('holding')
    s = stepAngler(s, 5.1, true, rng)
    expect(s.phase).toBe('sinking')
    s = stepAngler(s, 1.7, true, rng)
    expect(s.phase).toBe('hidden')
    expect(s.timer).toBeGreaterThanOrEqual(3)
    expect(s.timer).toBeLessThan(6)
  })
})

describe('seabed', () => {
  test('is deterministic for a seed', () => {
    expect(buildSeabed(80, 11)).toEqual(buildSeabed(80, 11))
    expect(buildSeabed(80, 11)).not.toEqual(buildSeabed(80, 12))
  })
  test('has 20 rows of the requested width', () => {
    const g = buildSeabed(40, 11)
    expect(g).toHaveLength(SEABED_ROWS)
    expect(g.every((r) => r.length === 40)).toBe(true)
  })
})
