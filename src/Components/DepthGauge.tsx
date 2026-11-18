import { useEffect, useRef, useState } from 'react'
import { useScrollDepth } from '../hooks/useScrollDepth'

export type GaugeStop = { label: string; depth: string; target: string }

// eslint-disable-next-line react-refresh/only-export-components
export const gaugeStops: GaugeStop[] = [
  { label: 'Surface', depth: '0 m', target: '#top' },
  { label: 'Projects', depth: '12 m', target: '#projects' },
  { label: 'Experience', depth: '24 m', target: '#experience' },
  { label: 'Certifications', depth: '30 m', target: '#certificates' },
  { label: 'Contact', depth: '36 m', target: '#contact' },
]

/** Index of the last section whose top is at or above the viewport middle (0 if none). */
// eslint-disable-next-line react-refresh/only-export-components
export function currentStop(sectionTops: number[], viewportMid: number): number {
  let current = 0
  sectionTops.forEach((top, i) => {
    if (top <= viewportMid) current = i
  })
  return current
}

function readStop(stops: GaugeStop[]): number {
  const tops = stops.map((s) => {
    const el = document.querySelector(s.target)
    return el ? el.getBoundingClientRect().top : Number.POSITIVE_INFINITY
  })
  return currentStop(tops, window.innerHeight / 2)
}

function isDeep(stops: GaugeStop[], index: number): boolean {
  const el = document.querySelector(stops[index].target)
  return !!el && el.closest('[data-depth="deep"]') !== null
}

export default function DepthGauge({ stops }: { stops: GaugeStop[] }) {
  const depth = useScrollDepth()
  const [current, setCurrent] = useState(0)
  const [deep, setDeep] = useState(false)
  const frame = useRef(0)

  useEffect(() => {
    const apply = () => {
      frame.current = 0
      const i = readStop(stops)
      setCurrent(i)
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
      <span aria-hidden="true" className="depth-gauge__fill" style={{ transform: `scaleY(${depth})` }} />
      {stops.map((s, i) => (
        <a key={s.target} href={s.target} aria-current={i === current ? 'location' : undefined}>
          <span className="depth-gauge__name">{s.label}</span>
          <span className="depth-gauge__m">{s.depth}</span>
          <i aria-hidden="true" />
        </a>
      ))}
    </nav>
  )
}
