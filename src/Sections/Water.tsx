import { useLayoutEffect, useState } from 'react'

const STOPS = ['#e9f0f9', '#93b1e6', '#3557c2', '#0a0e28', '#05080f'].map((hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
])

/** Piecewise mix across the five water stops at 0, .25, .5, .75, 1. */
// eslint-disable-next-line react-refresh/only-export-components
export function waterColor(depth: number): string {
  const d = Math.min(1, Math.max(0, depth))
  const pos = d * (STOPS.length - 1)
  const i = Math.min(STOPS.length - 2, Math.floor(pos))
  const t = pos - i
  const rgb = STOPS[i].map((c, k) => Math.round(c + (STOPS[i + 1][k] - c) * t))
  return '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('')
}

export type WaterLayout = {
  projects: { top: number; height: number }
  experience: number
  certificates: number
  contact: number
  page: number
}

const [SURFACE, SHALLOWS, REEF, DEEP, ABYSS] = ['#e9f0f9', '#93b1e6', '#3557c2', '#0a0e28', '#05080f']

/**
 * One gradient down the whole page, pinned to the sections (page px), so each section always
 * sits on its own water whatever the screen height: surface through the hero, shallows inside
 * Projects, reef where Experience starts, deep at Certifications, abyss from Contact down.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function waterGradient(l: WaterLayout): string {
  const raw: [string, number][] = [
    [SURFACE, 0],
    [SURFACE, l.projects.top],
    [SHALLOWS, l.projects.top + l.projects.height * 0.6],
    [REEF, l.experience],
    [DEEP, l.certificates],
    [ABYSS, l.contact],
    [ABYSS, l.page],
  ]
  let last = 0
  const stops = raw.map(([c, y]) => {
    last = Math.max(last, Math.round(y))
    return `${c} ${last}px`
  })
  return `linear-gradient(180deg, ${stops.join(', ')})`
}

/** Page-coordinate layout of the home sections; null until they exist. */
function measure(): WaterLayout | null {
  const y = window.scrollY
  const top = (id: string) => {
    const el = document.getElementById(id)
    return el ? el.getBoundingClientRect().top + y : null
  }
  const p = document.getElementById('projects')
  const [e, c, k] = [top('experience'), top('certificates'), top('contact')]
  if (!p || e === null || c === null || k === null) return null
  const r = p.getBoundingClientRect()
  return {
    projects: { top: r.top + y, height: r.height },
    experience: e,
    certificates: c,
    contact: k,
    page: document.documentElement.scrollHeight,
  }
}

// Before the first measure (and in tests): a reasonable page-proportional fallback.
const FALLBACK = `linear-gradient(180deg, ${SURFACE} 0%, ${SURFACE} 12%, ${SHALLOWS} 22%, ${REEF} 34%, ${DEEP} 62%, ${ABYSS} 78%, ${ABYSS} 100%)`

const RAYS =
  'repeating-conic-gradient(from 168deg at 50% -18%, rgba(255,255,255,0.2) 0deg 2.5deg, rgba(255,255,255,0) 2.5deg 8deg)'
const FADE = 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent)'

/** The water down the whole page (behind everything), plus rays near the surface. */
export function Water() {
  const [layout, setLayout] = useState<WaterLayout | null>(null)

  useLayoutEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const next = measure()
      setLayout((prev) => (prev && next && JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    // sections grow as fonts, images and lazy content arrive; re-pin the stops when they do
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null
    ro?.observe(document.body)
    window.addEventListener('resize', schedule)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <div
        data-testid="water"
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 -z-10 pointer-events-none"
        style={{ height: layout ? layout.page : '100%', background: layout ? waterGradient(layout) : FALLBACK }}
      />
      <div
        data-testid="water-rays"
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 -z-10 pointer-events-none h-[1400px]"
        style={{ background: RAYS, WebkitMaskImage: FADE, maskImage: FADE }}
      />
    </>
  )
}
