import { useEffect, useRef } from 'react'
import { useBooting } from '../boot/BootContext'
import { useScrollDepth } from '../hooks/useScrollDepth'
import type { AquariumEngine, AquariumMode, Zone } from './renderer'

// Text that sits straight on the water: hero copy, section headings, contact text, footer.
const CALM = '#top h1, #top > div > p, main h2, #contact > div > *, body footer'
const GRID_FADE = 180

const rects = (selector: string) => Array.from(document.querySelectorAll(selector), (el) => el.getBoundingClientRect())

function homeZones(): Zone[] {
  const zones: Zone[] = []
  const hero = document.getElementById('top')
  const contact = document.getElementById('contact')
  if (hero) zones.push({ top: -1e5, bottom: hero.getBoundingClientRect().bottom - GRID_FADE * 0.5 })
  if (contact) zones.push({ top: contact.getBoundingClientRect().top + 40, bottom: 1e5 })
  return zones
}

function footerTop(): number {
  const footer = document.querySelector('body footer')
  return footer ? footer.getBoundingClientRect().top : 1e6
}

type Cancel = () => void

/** Runs `fn` when the main thread is idle (or soon, where requestIdleCallback is missing). */
function whenIdle(fn: () => void): Cancel {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: 1500 })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(fn, 0)
  return () => clearTimeout(id)
}

/**
 * The live tank: a fixed full-screen canvas above the water and below the content.
 * The renderer is a separate chunk. It loads and starts after the boot overlay is
 * gone and the main thread is idle, so it never competes with the first paint.
 */
export function Aquarium({ mode }: { mode: AquariumMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<AquariumEngine | null>(null)
  const depth = useScrollDepth()
  const depthRef = useRef(depth)
  const booting = useBooting()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || booting) return
    let cleanup: Cancel | undefined
    let cancelled = false

    const start = async () => {
      const { createAquarium } = await import('./renderer')
      if (cancelled) return
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const home = mode === 'home'
      const engine = createAquarium(canvas, {
        mode,
        reducedMotion,
        calmRects: () => (home ? rects(CALM) : []),
        gridZones: () => (home ? homeZones() : []),
        // 404: the floor sits on the footer, never below the viewport bottom
        floorY: home ? footerTop : () => Math.min(footerTop(), window.innerHeight),
      })
      engine.setDepth(depthRef.current)
      engineRef.current = engine
      const root = document.documentElement
      root.dataset.aquarium = mode

      const onVisibility = () => {
        if (document.visibilityState === 'hidden') engine.stop()
        else engine.start()
      }
      document.addEventListener('visibilitychange', onVisibility)
      if (document.visibilityState !== 'hidden') engine.start()

      cleanup = () => {
        document.removeEventListener('visibilitychange', onVisibility)
        engine.destroy()
        engineRef.current = null
        delete root.dataset.aquarium
      }
    }
    const cancelIdle = whenIdle(() => void start())

    return () => {
      cancelled = true
      cancelIdle()
      cleanup?.()
    }
  }, [mode, booting])

  useEffect(() => {
    depthRef.current = depth
    engineRef.current?.setDepth(depth)
  }, [depth])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="aquarium"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: -5, pointerEvents: 'none' }}
    />
  )
}
