import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { bandHeight, CLOUD_TILES } from './clouds'
import { createAquarium, type AquariumOptions } from './renderer'

type Rect = { x: number; y: number; fill: string }

// jsdom has no canvas. Each canvas gets its own recording 2D context, so the test can
// read what the visible tank drew without the offscreen grid and seabed canvases.
const recorders = new WeakMap<HTMLCanvasElement, Rect[]>()
function recordingContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const rects: Rect[] = []
  recorders.set(canvas, rects)
  const state: Record<string | symbol, unknown> = { fillStyle: '' }
  return new Proxy(state, {
    get(target, key) {
      if (key === 'fillRect') return (x: number, y: number) => rects.push({ x, y, fill: String(target.fillStyle) })
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

function engine(canvas: HTMLCanvasElement, sky: { cloudTop: number; surface: number }, reducedMotion = true) {
  const opts: AquariumOptions = {
    mode: 'home',
    reducedMotion,
    calmRects: () => [],
    gridZones: () => [],
    floorY: () => 1e6,
    sky: () => sky,
  }
  return createAquarium(canvas, opts)
}

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
    const e = engine(canvas, { cloudTop: 70, surface: window.innerHeight })
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
    const e = engine(canvas, { cloudTop: -2000, surface: -1000 })
    e.start()
    const rects = recorders.get(canvas)!
    expect(rects.some((r) => SKY_FILLS.has(r.fill))).toBe(false)
    expect(rects.length).toBeGreaterThan(0)
    e.destroy()
  })

  test('reduced motion: the clouds stand still between redraws and no loop starts', () => {
    const canvas = document.createElement('canvas')
    const e = engine(canvas, { cloudTop: 70, surface: window.innerHeight })
    e.start()
    const first = recorders.get(canvas)!.map((r) => `${r.x},${r.y},${r.fill}`)
    window.dispatchEvent(new Event('scroll'))
    const second = recorders.get(canvas)!.map((r) => `${r.x},${r.y},${r.fill}`)
    expect(second).toEqual(first)
    expect(requestAnimationFrame).not.toHaveBeenCalled()
    e.destroy()
  })
})
