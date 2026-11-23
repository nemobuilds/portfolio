import { describe, expect, test } from 'vitest'
import {
  bandHeight,
  bandRows,
  fitCell,
  MIN_CLOUD_CELL,
  CLOUD_CROSSING_S,
  CLOUD_TILES,
  cloudCell,
  cloudCells,
  cloudSpeed,
  loopLength,
  makeClouds,
  shapeCols,
  skyFade,
  stepClouds,
} from './clouds'

describe('cloud band (option C)', () => {
  test('four clouds in one band, all moving at the same speed', () => {
    const clouds = makeClouds(1280)
    expect(clouds).toHaveLength(4)
    const before = clouds.map((c) => c.x)
    stepClouds(clouds, 1, 1280)
    const moved = clouds.map((c, i) => c.x - before[i])
    for (const d of moved) expect(d).toBeCloseTo(cloudSpeed(1280))
  })

  test('one crossing takes about 50 seconds', () => {
    expect(CLOUD_CROSSING_S).toBeGreaterThanOrEqual(45)
    expect(CLOUD_CROSSING_S).toBeLessThanOrEqual(60)
    expect(cloudSpeed(1280) * CLOUD_CROSSING_S).toBeCloseTo(loopLength(1280))
  })

  test('the band stays shallow: under 90px on desktop, under 70px on phones', () => {
    expect(bandHeight(1280)).toBeLessThanOrEqual(90)
    expect(bandHeight(390)).toBeLessThanOrEqual(70)
    for (const c of makeClouds(1280)) expect(c.row).toBeGreaterThanOrEqual(0)
  })

  test('phones use smaller tiles than the fish cell', () => {
    expect(cloudCell(1280)).toBe(14)
    expect(cloudCell(390)).toBeLessThan(14)
  })

  test('a cloud that leaves on the right comes back from the left, never lost', () => {
    const clouds = makeClouds(1280)
    for (let s = 0; s < 400; s++) stepClouds(clouds, 0.5, 1280)
    const pad = shapeCols('med') * cloudCell(1280)
    for (const c of clouds) {
      expect(c.x).toBeLessThanOrEqual(1280)
      expect(c.x).toBeGreaterThanOrEqual(-pad - loopLength(1280))
    }
  })

  test('clouds start spread out, not on top of each other', () => {
    const xs = makeClouds(1280).map((c) => c.x).sort((a, b) => a - b)
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThan(200)
  })
})

describe('cloud tiles', () => {
  const sky = new Set<string>(Object.values(CLOUD_TILES).map((t) => t.fill))

  test('only sky colours, never the fish orange', () => {
    for (const c of makeClouds(1280)) for (const k of cloudCells(c, 0)) expect(sky.has(k.tile.fill)).toBe(true)
    expect(sky.has('#FF8237')).toBe(false)
  })

  test('shimmer flips some glyphs between steps but never the tile colours', () => {
    const [c] = makeClouds(1280)
    const a = cloudCells(c, 0)
    const b = cloudCells(c, 1)
    expect(b.map((k) => k.tile.fill)).toEqual(a.map((k) => k.tile.fill))
    const changed = a.filter((k, i) => k.glyph !== b[i].glyph).length
    expect(changed).toBeGreaterThan(0)
    expect(changed).toBeLessThan(a.length / 2)
  })

  test('the same step always draws the same cloud (a still frame for reduced motion)', () => {
    const [c] = makeClouds(1280)
    expect(cloudCells(c, 0)).toEqual(cloudCells(c, 0))
  })
})

describe('fitCell', () => {
  test('full-size tiles when the band fits the room', () => {
    expect(fitCell(1280, bandHeight(1280))).toBe(14)
    expect(fitCell(390, 66)).toBe(10)
  })
  test('smaller tiles when the room is tight, so the band never reaches the text', () => {
    const cell = fitCell(1280, 50)
    expect(cell).toBeGreaterThanOrEqual(MIN_CLOUD_CELL)
    expect(cell * bandRows()).toBeLessThanOrEqual(50)
  })
  test('no clouds when even the smallest tile would not fit', () => {
    expect(fitCell(390, MIN_CLOUD_CELL * bandRows() - 1)).toBe(0)
  })
})

describe('skyFade', () => {
  test('hidden above the surface, fades in over the fade band, fully visible below it', () => {
    expect(skyFade(100, 500, 180)).toBe(1)
    expect(skyFade(500, 500, 180)).toBe(1)
    expect(skyFade(590, 500, 180)).toBeCloseTo(0.5)
    expect(skyFade(680, 500, 180)).toBe(0)
    expect(skyFade(2000, 500, 180)).toBe(0)
  })
})
