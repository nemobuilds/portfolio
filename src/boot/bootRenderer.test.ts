import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { deviceRect, reuseCanvas } from './bootBuffers'
import { createBootRenderer } from './bootRenderer'

// jsdom has no 2D canvas. This fake context accepts every call and records nothing,
// which is enough to watch which buffers the renderer makes and when.
function fakeContext(canvas: HTMLCanvasElement) {
  const props: Record<string | symbol, unknown> = { canvas }
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

let frames: FrameRequestCallback[] = []
let made: HTMLCanvasElement[] = []
let clock = 1000

function step(n: number) {
  for (let i = 0; i < n; i++) {
    clock += 1000 / 60
    const run = frames
    frames = []
    for (const cb of run) cb(clock)
  }
}

function setViewport(w: number, h: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: h })
}

beforeEach(() => {
  frames = []
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
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
  vi.stubGlobal('cancelAnimationFrame', () => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
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

  test('the name buffers are name-sized, not viewport-sized', async () => {
    const r = createBootRenderer(document.createElement('canvas'), { reducedMotion: false })
    await Promise.resolve()
    step(2)
    const buffers = made.slice(1) // made[0] is the screen canvas from the test
    expect(buffers.length).toBeGreaterThan(0)
    for (const c of buffers) expect(c.width * c.height).toBeLessThan(1440 * 900 / 4)
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

  test('deviceRect grows by the margin and snaps outward to whole device pixels', () => {
    expect(deviceRect({ left: 10.3, top: 5.6, right: 20.2, bottom: 9.1 }, 1, 2)).toEqual({ x: 18, y: 9, w: 25, h: 12 })
    expect(deviceRect({ left: 0, top: 0, right: 0, bottom: 0 }, 0, 1)).toEqual({ x: 0, y: 0, w: 1, h: 1 })
  })
})
