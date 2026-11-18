import { useScrollDepth } from '../hooks/useScrollDepth'

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

const RAYS =
  'repeating-conic-gradient(from 168deg at 50% -18%, rgba(255,255,255,0.2) 0deg 2.5deg, rgba(255,255,255,0) 2.5deg 8deg)'
const FADE = 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent)'

/** Fixed colour layer that follows scroll depth, plus rays that scroll with the page. */
export function Water() {
  const depth = useScrollDepth()
  return (
    <>
      <div
        data-testid="water"
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: waterColor(depth) }}
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
