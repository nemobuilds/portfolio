import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { BOOT_PALETTE, paletteAt } from '../tiles/palette'
import { atlasCell, atlasSize, bucketColor, deviceRect, HUE_BUCKETS, hueBucket, reuseCanvas, shimmerDue } from './bootBuffers'
import { createBootRenderer } from './bootRenderer'

// jsdom has no 2D canvas. This fake context accepts every call and records nothing,
// which is enough to watch which buffers the renderer makes and when.
const clears = new WeakMap<HTMLCanvasElement, number>()
const fills = new WeakMap<HTMLCanvasElement, number>()

function fakeContext(canvas: HTMLCanvasElement) {
  const props: Record<string | symbol, unknown> = {
    canvas,
    clearRect: () => clears.set(canvas, (clears.get(canvas) ?? 0) + 1),
    fillRect: () => fills.set(canvas, (fills.get(canvas) ?? 0) + 1),
  }
  const metrics = { width: 300, actualBoundingBoxLeft: 150, actualBoundingBoxRight: 150, actualBoundingBoxAscent: 40, actualBoundingBoxDescent: 12 }
  return new Proxy(props, {
    get(t, k) {
      if (k in t) return t[k]
      if (k === 'measureText') return () => metrics
      if (k === 'createLinearGradient') return () => ({ addColorStop() {} })
      return () => {}
    },
    set(t, k, v) {
      t[k] = v
      return true
    },
  })
}

let frames = new Map<number, FrameRequestCallback>()
let nextFrame = 0
let made: HTMLCanvasElement[] = []
let clock = 1000

function step(n: number) {
  for (let i = 0; i < n; i++) {
    clock += 1000 / 60
    const run = frames
    frames = new Map()
    for (const cb of run.values()) cb(clock)
  }
}

/** Screen redraws over n frames at 60 Hz. Each redraw clears the screen canvas once. */
function redraws(screen: HTMLCanvasElement, n: number) {
  const before = clears.get(screen) ?? 0
  step(n)
  return (clears.get(screen) ?? 0) - before
}

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, value: hidden })
  document.dispatchEvent(new Event('visibilitychange'))
}

function setViewport(w: number, h: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: h })
}

beforeEach(() => {
  frames = new Map()
  made = []
  clock = 1000
  setViewport(1440, 900)
  const contexts = new WeakMap<HTMLCanvasElement, unknown>()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
    if (!contexts.has(this)) contexts.set(this, fakeContext(this))
    return contexts.get(this) as CanvasRenderingContext2D
  } as typeof HTMLCanvasElement.prototype.getContext)
  const create = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    const el = create(tag)
    if (tag === 'canvas') made.push(el as HTMLCanvasElement)
    return el
  }) as typeof document.createElement)
  vi.stubGlobal('Path2D', class { rect() {} roundRect() {} })
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    frames.set(++nextFrame, cb)
    return nextFrame
  })
  vi.stubGlobal('cancelAnimationFrame', (h: number) => frames.delete(h))
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(document, 'hidden')
})

describe('boot renderer frame rate', () => {
  test('the shimmer draws at 30 fps; the drop and the wave draw every frame', async () => {
    const screen = document.createElement('canvas')
    const r = createBootRenderer(screen, { reducedMotion: false })
    await Promise.resolve()
    step(1)
    expect(redraws(screen, 20)).toBe(10) // fill: every second frame at 60 Hz
    const onDone = vi.fn()
    r.play(onDone) // water fills (~45 frames), holds 0.3 s, then the drop and the wave
    step(90)
    expect(redraws(screen, 20)).toBe(20)
    step(200)
    expect(onDone).toHaveBeenCalledTimes(1)
    r.destroy()
  })

  test('a resize repaints the dark screen at once, before the next frame', async () => {
    const screen = document.createElement('canvas')
    const r = createBootRenderer(screen, { reducedMotion: false })
    expect(fills.get(screen)).toBeGreaterThan(0) // dark from the start: the page never shows
    await Promise.resolve()
    step(1)
    const before = fills.get(screen) ?? 0
    setViewport(1920, 1080)
    window.dispatchEvent(new Event('resize'))
    expect(fills.get(screen)).toBe(before + 1)
    expect(redraws(screen, 1)).toBe(1) // and the next frame is a full draw, never a skipped one
    r.destroy()
  })

  test('a hidden tab does no frame work and carries on when shown again', async () => {
    const screen = document.createElement('canvas')
    const r = createBootRenderer(screen, { reducedMotion: false })
    await Promise.resolve()
    setHidden(true)
    expect(frames.size).toBe(0)
    expect(redraws(screen, 20)).toBe(0)
    setHidden(false)
    expect(redraws(screen, 20)).toBe(10)
    r.destroy()
  })
})

describe('boot renderer buffers', () => {
  test('the water buffer is reused across frames and made again only on a resize', async () => {
    const r = createBootRenderer(document.createElement('canvas'), { reducedMotion: false })
    await Promise.resolve() // fonts ready: a second layout at the same size reuses every buffer
    await Promise.resolve()
    step(2)
    const settled = made.length
    step(30)
    expect(made.length).toBe(settled)

    window.dispatchEvent(new Event('resize')) // same size: nothing new
    step(2)
    expect(made.length).toBe(settled)

    setViewport(1920, 1080)
    window.dispatchEvent(new Event('resize'))
    const afterResize = made.length
    expect(afterResize).toBeGreaterThan(settled)
    step(30)
    expect(made.length).toBe(afterResize)
    r.destroy()
  })

  test('the name buffers and the tile atlas are far smaller than the viewport', async () => {
    const r = createBootRenderer(document.createElement('canvas'), { reducedMotion: false })
    await Promise.resolve()
    step(2)
    const buffers = made.slice(1) // made[0] is the screen canvas from the test
    expect(buffers.length).toBe(4) // atlas, letter mask, plate, water
    for (const c of buffers) expect(c.width * c.height).toBeLessThan((1440 * 900) / 4)
    r.destroy()
  })
})

describe('buffer helpers', () => {
  test('reuseCanvas keeps a same-sized canvas and replaces a resized one', () => {
    const create = vi.fn((w: number, h: number) => ({ width: w, height: h }))
    const a = reuseCanvas(undefined, 10, 20, create)
    expect(reuseCanvas(a, 10, 20, create)).toBe(a)
    expect(reuseCanvas(a, 11, 20, create)).not.toBe(a)
    expect(create).toHaveBeenCalledTimes(2)
  })

  test('shimmerDue keeps every second 60 Hz frame and every fourth 120 Hz frame', () => {
    const hz = (rate: number, n: number) => {
      let last = -Infinity, drawn = 0
      for (let f = 0; f < n; f++) {
        const now = (f * 1000) / rate
        if (shimmerDue(now, last)) {
          last = now
          drawn++
        }
      }
      return drawn
    }
    expect(hz(60, 60)).toBe(30)
    expect(hz(120, 120)).toBe(30)
    expect(hz(30, 30)).toBe(30) // a slow screen loses no frames
  })

  test('hueBucket wraps like the palette walk and stays in range', () => {
    expect(hueBucket(0)).toBe(0)
    expect(hueBucket(1)).toBe(0)
    expect(hueBucket(-0.25)).toBe(hueBucket(0.75))
    expect(hueBucket(0.999999)).toBe(HUE_BUCKETS - 1)
    expect(hueBucket(2.5)).toBe(HUE_BUCKETS / 2)
  })

  test('each bucket colour sits between the two old 256-step table entries it replaces', () => {
    for (const b of [0, 17, 64, HUE_BUCKETS - 1]) {
      const [r] = bucketColor(b).match(/\d+/g)!.map(Number)
      const a = paletteAt(BOOT_PALETTE, (2 * b) / 256)[0] | 0
      const c = paletteAt(BOOT_PALETTE, (2 * b + 1) / 256)[0] | 0
      expect(r).toBeGreaterThanOrEqual(Math.min(a, c))
      expect(r).toBeLessThanOrEqual(Math.max(a, c))
    }
    expect(bucketColor(0)).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
  })

  test('atlas cells never overlap and fit the atlas', () => {
    const cell = 66
    const size = atlasSize(5, cell)
    const seen = new Set<string>()
    for (let l = 0; l < 5; l++)
      for (let b = 0; b < HUE_BUCKETS; b++) {
        const { sx, sy } = atlasCell(l, b, cell)
        seen.add(`${sx},${sy}`)
        expect(sx + cell).toBeLessThanOrEqual(size.w)
        expect(sy + cell).toBeLessThanOrEqual(size.h)
      }
    expect(seen.size).toBe(5 * HUE_BUCKETS)
    // a 5K-wide screen at DPR 2 still fits the 16384 px canvas limit
    expect(Math.max(atlasSize(5, 132).w, atlasSize(5, 132).h)).toBeLessThanOrEqual(16384)
  })

  test('deviceRect grows by the margin and snaps outward to whole device pixels', () => {
    expect(deviceRect({ left: 10.3, top: 5.6, right: 20.2, bottom: 9.1 }, 1, 2)).toEqual({ x: 18, y: 9, w: 25, h: 12 })
    expect(deviceRect({ left: 0, top: 0, right: 0, bottom: 0 }, 0, 1)).toEqual({ x: 0, y: 0, w: 1, h: 1 })
  })
})
