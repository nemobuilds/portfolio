import { useEffect, useRef, useState } from 'react'

export type GaugeStop = { label: string; depth: string; target: string }

// eslint-disable-next-line react-refresh/only-export-components
export const gaugeStops: GaugeStop[] = [
  { label: 'Surface', depth: '0 m', target: '#top' },
  { label: 'Projects', depth: '12 m', target: '#projects' },
  { label: 'Experience', depth: '24 m', target: '#experience' },
  { label: 'Certifications', depth: '30 m', target: '#certificates' },
  { label: 'Contact', depth: '36 m', target: '#contact' },
]

/**
 * Where the visitor is reading, in page coordinates. It starts at the top of the
 * viewport when the page is at the top and ends at the page bottom when fully
 * scrolled, so the first and last stops are always reachable on any screen height.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function readingLine(scrollY: number, viewportHeight: number, pageHeight: number): number {
  const maxScroll = pageHeight - viewportHeight
  if (maxScroll <= 0) return 0
  const f = Math.min(1, Math.max(0, scrollY / maxScroll))
  return scrollY + viewportHeight * f
}

/**
 * The current stop and how far the line is filled (0–1, stops evenly spaced),
 * both from the same reading line so the fill always ends at or just past the
 * current stop and before the next one. Missing sections (Infinity) are skipped.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function gaugeState(pageTops: number[], line: number): { current: number; fill: number } {
  const last = pageTops.length - 1
  if (last <= 0) return { current: 0, fill: 0 }
  let current = 0
  pageTops.forEach((top, i) => {
    if (Number.isFinite(top) && top <= line) current = i
  })
  let next = -1
  for (let j = current + 1; j <= last; j++) {
    if (Number.isFinite(pageTops[j])) { next = j; break }
  }
  if (next === -1) return { current, fill: current / last }
  const span = pageTops[next] - pageTops[current]
  const frac = span > 0 ? Math.min(1, Math.max(0, (line - pageTops[current]) / span)) : 0
  return { current, fill: (current + frac * (next - current)) / last }
}

function readState(stops: GaugeStop[]): { current: number; fill: number } {
  const y = window.scrollY
  const tops = stops.map((s) => {
    const el = document.querySelector(s.target)
    return el ? el.getBoundingClientRect().top + y : Number.POSITIVE_INFINITY
  })
  const line = readingLine(y, window.innerHeight, document.documentElement.scrollHeight)
  return gaugeState(tops, line)
}

function isDeep(stops: GaugeStop[], index: number): boolean {
  const el = document.querySelector(stops[index].target)
  return !!el && el.closest('[data-depth="deep"]') !== null
}

export default function DepthGauge({ stops }: { stops: GaugeStop[] }) {
  const [current, setCurrent] = useState(0)
  const [fill, setFill] = useState(0)
  const [deep, setDeep] = useState(false)
  const frame = useRef(0)

  useEffect(() => {
    const apply = () => {
      frame.current = 0
      const { current: i, fill: f } = readState(stops)
      setCurrent(i)
      setFill(f)
      setDeep(isDeep(stops, i))
    }
    const schedule = () => {
      if (!frame.current) frame.current = requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [stops])

  return (
    <nav aria-label="Depth" className={`depth-gauge ${deep ? 'depth-gauge--deep' : ''}`}>
      <span aria-hidden="true" className="depth-gauge__fill" style={{ transform: `scaleY(${fill})` }} />
      {stops.map((s, i) => (
        <a key={s.target} href={s.target} aria-current={i === current ? 'location' : undefined} data-past={i < current ? '' : undefined}>
          <span className="depth-gauge__name">{s.label}</span>
          <span className="depth-gauge__m">{s.depth}</span>
          <i aria-hidden="true" />
        </a>
      ))}
    </nav>
  )
}
