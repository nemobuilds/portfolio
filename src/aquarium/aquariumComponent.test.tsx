import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { BootContext } from '../boot/BootContext'
import { Aquarium } from './Aquarium'

const spies = vi.hoisted(() => ({ destroy: vi.fn(), create: vi.fn() }))

// Wrap the real engine so a test can see destroy() without replacing the renderer.
vi.mock('./renderer', async (importOriginal) => {
  const real = await importOriginal<typeof import('./renderer')>()
  return {
    ...real,
    createAquarium: (...args: Parameters<typeof real.createAquarium>) => {
      spies.create()
      const engine = real.createAquarium(...args)
      return {
        ...engine,
        destroy: () => {
          spies.destroy()
          engine.destroy()
        },
      }
    },
  }
})

// jsdom has no canvas: every 2D context call is a no-op.
function fakeContext(): CanvasRenderingContext2D {
  const gradient = { addColorStop: () => {} }
  return new Proxy({} as Record<string | symbol, unknown>, {
    get(target, key) {
      if (key in target) return target[key]
      if (key === 'createLinearGradient') return () => gradient
      return () => {}
    },
    set(target, key, value) {
      target[key] = value
      return true
    },
  }) as unknown as CanvasRenderingContext2D
}

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches: reduce && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList) as typeof window.matchMedia
}

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') })
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
}

let raf: ReturnType<typeof vi.fn>
let caf: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    (() => fakeContext()) as unknown as typeof HTMLCanvasElement.prototype.getContext,
  )
  raf = vi.fn(() => 7)
  caf = vi.fn()
  vi.stubGlobal('requestAnimationFrame', raf)
  vi.stubGlobal('cancelAnimationFrame', caf)
  setReducedMotion(false)
  setHidden(false)
  spies.destroy.mockClear()
  spies.create.mockClear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  setReducedMotion(false)
  setHidden(false)
})

describe('Aquarium', () => {
  test('canvas is hidden from assistive tech and clicks', () => {
    const { container } = render(<Aquarium mode="home" />)
    const canvas = container.querySelector('canvas')!
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
    expect(canvas.style.pointerEvents).toBe('none')
    expect(canvas.style.position).toBe('fixed')
  })

  test('starts an animation loop with motion allowed', async () => {
    render(<Aquarium mode="home" />)
    await waitFor(() => expect(raf).toHaveBeenCalled())
  })

  test('loads the renderer only after the boot overlay is gone', async () => {
    const { rerender } = render(
      <BootContext value={true}>
        <Aquarium mode="home" />
      </BootContext>,
    )
    await new Promise((r) => setTimeout(r, 30))
    expect(spies.create).not.toHaveBeenCalled()
    expect(document.documentElement.dataset.aquarium).toBeUndefined()
    rerender(
      <BootContext value={false}>
        <Aquarium mode="home" />
      </BootContext>,
    )
    await waitFor(() => expect(spies.create).toHaveBeenCalledTimes(1))
    expect(document.documentElement.dataset.aquarium).toBe('home')
  })

  test('unmount before the renderer loads creates no engine', async () => {
    const { unmount } = render(<Aquarium mode="home" />)
    unmount()
    await new Promise((r) => setTimeout(r, 30))
    expect(spies.create).not.toHaveBeenCalled()
  })

  test('reduced motion draws once and starts no loop', async () => {
    setReducedMotion(true)
    const fills = vi.fn()
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation((() => {
      const ctx = fakeContext()
      ;(ctx as unknown as Record<string, unknown>).clearRect = fills
      return ctx
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext)
    render(<Aquarium mode="home" />)
    await waitFor(() => expect(fills).toHaveBeenCalled())
    expect(raf.mock.calls.length).toBeLessThanOrEqual(1)
  })

  test('hidden tab stops the loop and a visible tab restarts it', async () => {
    render(<Aquarium mode="home" />)
    await waitFor(() => expect(spies.create).toHaveBeenCalled())
    raf.mockClear()
    setHidden(true)
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(caf).toHaveBeenCalled()
    setHidden(false)
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(raf).toHaveBeenCalled()
  })

  test('unmount destroys the engine', async () => {
    const { unmount } = render(<Aquarium mode="angler-only" />)
    await waitFor(() => expect(spies.create).toHaveBeenCalled())
    unmount()
    expect(spies.destroy).toHaveBeenCalledTimes(1)
    expect(caf).toHaveBeenCalled()
  })
})
