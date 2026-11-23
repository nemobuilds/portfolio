import { useEffect, useRef } from 'react'
import { useBooting } from '../boot/BootContext'
import { useScrollDepth } from '../hooks/useScrollDepth'
import type { AquariumEngine, AquariumMode, Zone } from './renderer'

// Text that sits straight on the water: hero copy, section headings, contact text, footer.
const CALM = '#top h1, #top p, main h2, #contact > div > *, body footer'
// Controls, headings and cards (including the tech stack tiles): a whole fish, bubble or
// cloud passing one fades down, then back up when it leaves. Nothing is clipped.
const CLEAR = 'main a, main button, main h1, main h2, main h3, main article, main li, main [role="button"]'
// The page sections fish live in. Each gets its own fish, which scroll away with it.
// Contact is left out: by that depth the clownfish have faded out (clownfishAlpha).
const FISH_REGIONS = ['#projects', '#experience', '#certificates']
const GRID_FADE = 180

function homeRegions(): Zone[] {
  return FISH_REGIONS.flatMap((sel) => {
    const el = document.querySelector(sel)
    if (!el) return []
    const r = el.getBoundingClientRect()
    return [{ top: r.top, bottom: r.bottom }]
  })
}
/** The cloud band starts this far below the hero top: just under the floating navbar (16px + ~54px). */
const CLOUD_TOP = 76
/** Gap kept between the lowest cloud and the hero's first line of text. */
const CLOUD_GAP = 8

/**
 * The hero is sky: the clouds get the room between the navbar and the hero's first line
 * of text (the greeting), so no tile overlaps the text or the photo; the surface sits
 * where the hero grid starts to fade.
 */
function homeSky(): { cloudTop: number; cloudBottom: number; surface: number } | null {
  const hero = document.getElementById('top')
  if (!hero) return null
  const r = hero.getBoundingClientRect()
  const first = hero.querySelector('p, h1')
  const textTop = first ? first.getBoundingClientRect().top : r.top + CLOUD_TOP
  return { cloudTop: r.top + CLOUD_TOP, cloudBottom: textTop - CLOUD_GAP, surface: r.bottom - GRID_FADE * 0.5 }
}

const rects = (selector: string) => Array.from(document.querySelectorAll(selector), (el) => el.getBoundingClientRect())

function homeZones(): Zone[] {
  const zones: Zone[] = []
  const hero = document.getElementById('top')
  const contact = document.getElementById('contact')
  if (hero) zones.push({ top: -1e5, bottom: hero.getBoundingClientRect().bottom - GRID_FADE * 0.5 })
  if (contact) zones.push({ top: contact.getBoundingClientRect().top + 120, bottom: 1e5 })
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
        sky: home ? homeSky : undefined,
        clearRects: () => (home ? rects(CLEAR) : []),
        regions: home ? homeRegions : undefined,
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
