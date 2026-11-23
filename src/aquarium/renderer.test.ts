import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { bandHeight, CLOUD_TILES } from './clouds'
import { VEIL_MIN } from './fish'
import { createAquarium, type AquariumOptions } from './renderer'

type Rect = { x: number; y: number; fill: string; alpha: number }

// jsdom has no canvas. Each canvas gets its own recording 2D context, so the test can
// read what the visible tank drew without the offscreen grid and seabed canvases.
const recorders = new WeakMap<HTMLCanvasElement, Rect[]>()
function recordingContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const rects: Rect[] = []
  recorders.set(canvas, rects)
  const state: Record<string | symbol, unknown> = { fillStyle: '' }
  return new Proxy(state, {
    get(target, key) {
      if (key === 'fillRect')
        return (x: number, y: number) =>
          rects.push({ x, y, fill: String(target.fillStyle), alpha: typeof target.globalAlpha === 'number' ? target.globalAlpha : 1 })
      if (key === 'clearRect') return () => rects.splice(0)
      if (key in target) return target[key]
      if (key === 'createLinearGradient') return () => ({ addColorStop: () => {} })
      return () => {}
    },
    set(target, key, value) {
      target[key] = value
      return true
    },
  }) as unknown as CanvasRenderingContext2D
}

const SKY_FILLS = new Set<string>(Object.values(CLOUD_TILES).map((t) => t.fill))

type Sky = { cloudTop: number; cloudBottom: number; surface: number }

function engine(canvas: HTMLCanvasElement, sky: Sky, extra: Partial<AquariumOptions> = {}) {
  const opts: AquariumOptions = {
    mode: 'home',
    reducedMotion: true,
    calmRects: () => [],
    gridZones: () => [],
    floorY: () => 1e6,
    sky: () => sky,
    ...extra,
  }
  return createAquarium(canvas, opts)
}

const roomy = (top: number): Sky => ({ cloudTop: top, cloudBottom: top + bandHeight(window.innerWidth), surface: window.innerHeight })

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
    return recordingContext(this)
  } as unknown as typeof HTMLCanvasElement.prototype.getContext)
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('hero sky in the tank', () => {
  test('the whole viewport is sky: only cloud tiles are drawn, no fish, inside the cloud band', () => {
    const canvas = document.createElement('canvas')
    const e = engine(canvas, roomy(70))
    e.start()
    const rects = recorders.get(canvas)!
    const clouds = rects.filter((r) => SKY_FILLS.has(r.fill))
    expect(clouds.length).toBeGreaterThan(0)
    expect(rects.filter((r) => !SKY_FILLS.has(r.fill))).toEqual([])
    for (const r of clouds) {
      expect(r.y).toBeGreaterThanOrEqual(70)
      expect(r.y).toBeLessThanOrEqual(70 + bandHeight(window.innerWidth))
    }
    e.destroy()
  })

  test('below the surface the fish are back, and the clouds are gone once the hero has scrolled away', () => {
    const canvas = document.createElement('canvas')
    const e = engine(canvas, { cloudTop: -2000, cloudBottom: -1900, surface: -1000 })
    e.start()
    const rects = recorders.get(canvas)!
    expect(rects.some((r) => SKY_FILLS.has(r.fill))).toBe(false)
    expect(rects.length).toBeGreaterThan(0)
    e.destroy()
  })

  test('reduced motion: the clouds stand still between redraws and no loop starts', () => {
    const canvas = document.createElement('canvas')
    const e = engine(canvas, roomy(70))
    e.start()
    const first = recorders.get(canvas)!.map((r) => `${r.x},${r.y},${r.fill}`)
    window.dispatchEvent(new Event('scroll'))
    const second = recorders.get(canvas)!.map((r) => `${r.x},${r.y},${r.fill}`)
    expect(second).toEqual(first)
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    e.destroy()
  })

  test('a tight room shrinks the tiles so every cloud stays between the navbar and the text', () => {
    const canvas = document.createElement('canvas')
    const e = engine(canvas, { cloudTop: 76, cloudBottom: 76 + 42, surface: window.innerHeight })
    e.start()
    const clouds = recorders.get(canvas)!.filter((r) => SKY_FILLS.has(r.fill))
    expect(clouds.length).toBeGreaterThan(0)
    for (const r of clouds) {
      expect(r.y).toBeGreaterThanOrEqual(76)
      // fillRect starts 1px inside the tile, so the tile bottom is at most cloudBottom
      expect(r.y - 1 + 7).toBeLessThanOrEqual(76 + 42)
    }
    e.destroy()
  })

  test('no room at all: no clouds rather than clouds over the text', () => {
    const canvas = document.createElement('canvas')
    const e = engine(canvas, { cloudTop: 76, cloudBottom: 96, surface: window.innerHeight })
    e.start()
    expect(recorders.get(canvas)!.some((r) => SKY_FILLS.has(r.fill))).toBe(false)
    e.destroy()
  })

  test('a fish passing a control or heading stays whole and fades as one sprite', () => {
    const water = { cloudTop: -2000, cloudBottom: -1900, surface: -1000 }
    const free = document.createElement('canvas')
    const a = engine(free, water)
    a.start()
    const open = recorders.get(free)!.slice()
    a.destroy()

    const covered = document.createElement('canvas')
    const whole = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight, width: window.innerWidth, height: window.innerHeight } as DOMRect
    const b = engine(covered, water, { clearRects: () => [whole] })
    b.start()
    const behind = recorders.get(covered)!.slice()
    b.destroy()

    expect(open.length).toBeGreaterThan(0)
    // the same tiles in the same places: nothing is clipped out of the fish
    expect(behind.map((r) => `${r.x},${r.y},${r.fill}`)).toEqual(open.map((r) => `${r.x},${r.y},${r.fill}`))
    // every tile is fainter, by the same factor, so the whole fish fades together
    for (const r of behind) expect(r.alpha).toBeLessThanOrEqual(VEIL_MIN + 1e-9)
    const ratios = new Set(behind.map((r, i) => (r.alpha / open[i].alpha).toFixed(6)))
    expect(ratios.size).toBe(1)
  })

  test('a cloud over text fades as a whole cloud, never tile by tile', () => {
    const canvas = document.createElement('canvas')
    const text = { left: 0, top: 0, right: 200, bottom: window.innerHeight, width: 200, height: window.innerHeight } as DOMRect
    const e = engine(canvas, roomy(70), { calmRects: () => [text] })
    e.start()
    const clouds = recorders.get(canvas)!.filter((r) => SKY_FILLS.has(r.fill))
    expect(clouds.length).toBeGreaterThan(0)
    // split the tiles into clouds by the gaps between them; each cloud has one opacity
    const sorted = clouds.slice().sort((p, q) => p.x - q.x)
    const groups: Rect[][] = []
    for (const r of sorted) {
      const g = groups[groups.length - 1]
      if (g && r.x - g[g.length - 1].x <= 30) g.push(r)
      else groups.push([r])
    }
    expect(groups.length).toBeGreaterThan(1)
    for (const g of groups) expect(new Set(g.map((r) => r.alpha.toFixed(4))).size).toBe(1)
    // a cloud over the text column (x < 200) is faded; the others are at full strength
    for (const g of groups) {
      const overText = g.some((r) => r.x < 200)
      if (overText) expect(g[0].alpha).toBeLessThan(0.9)
      else expect(g[0].alpha).toBeCloseTo(0.9)
    }
    e.destroy()
  })
})
