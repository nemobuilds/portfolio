import { clamp, flipState } from '../tiles/flip'
import { ditherPaths, LEVELS } from '../tiles/dither'
import { hash2 } from '../tiles/shimmer'
import { TO_DARK, TO_LIGHT } from '../tiles/palette'

export const SWITCH = { durationMs: 850, tile: 18, band: 9, ahead: 2.2, fadeFrom: 0.85 }

interface Point {
  x: number
  y: number
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export function revealRadius(p: number, maxR: number): number {
  return easeOutCubic(p) * (maxR + SWITCH.band * SWITCH.tile)
}

export function coverRadius(origin: Point, w: number, h: number): number {
  const far = Math.max(
    Math.hypot(origin.x, origin.y),
    Math.hypot(w - origin.x, origin.y),
    Math.hypot(origin.x, h - origin.y),
    Math.hypot(w - origin.x, h - origin.y),
  )
  return far + 4 * SWITCH.tile
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> }
}

function drawBand(
  ctx: CanvasRenderingContext2D,
  paths: Path2D[],
  palette: string[],
  origin: Point,
  w: number,
  h: number,
  dpr: number,
  p: number,
  r: number,
) {
  const { tile, band, ahead, fadeFrom } = SWITCH
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  const fade = p > fadeFrom ? 1 - (p - fadeFrom) / (1 - fadeFrom) : 1
  const cols = Math.ceil(w / tile) + 1
  const rows = Math.ceil(h / tile) + 1
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = i * tile + tile / 2
      const y = j * tile + tile / 2
      const h1 = hash2(i, j)
      const d = (Math.hypot(x - origin.x, y - origin.y) - r) / tile + h1 * 1.2 // < 0 inside the front
      if (d > ahead || d < -band) continue
      if (d > 0 && h1 < 0.55 + d * 0.2) continue // loose tiles ahead of the edge
      const { k, squash, turn } = flipState(-d, 0, 0, band)
      const lum = clamp(0.62 + 0.38 * turn * turn - k * 0.3 + (hash2(i + 5, j) - 0.5) * 0.3, 0, 1)
      const level = Math.min(LEVELS - 1, Math.floor(lum * LEVELS))
      const colour = palette[Math.floor(hash2(j + 3, i + 9) * (h1 > 0.93 ? palette.length : palette.length - 1))]
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(Math.max(squash, 0.05), 1)
      ctx.globalAlpha = fade * (0.8 + 0.2 * lum) * (1 - Math.pow(k, 3) * 0.6)
      ctx.fillStyle = colour
      ctx.fill(paths[level])
      ctx.restore()
    }
  }
}

/** Grows the new theme as a circle from `origin` with a band of flipping tiles on its edge. */
export async function animateThemeSwitch(origin: Point, apply: () => void): Promise<void> {
  const doc = document as ViewTransitionDoc
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || typeof doc.startViewTransition !== 'function') {
    apply()
    return
  }

  const w = window.innerWidth
  const h = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const maxR = coverRadius(origin, w, h)
  const canvas = document.createElement('canvas')
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = `position:fixed;inset:0;width:${w}px;height:${h}px;pointer-events:none;z-index:2147483647;view-transition-name:theme-band`
  const ctx = canvas.getContext('2d')

  // Its own view-transition name keeps the canvas above the clipped root snapshot.
  document.body.appendChild(canvas)
  let toDark = false
  const transition = doc.startViewTransition(() => {
    apply()
    toDark = document.documentElement.dataset.theme === 'dark'
  })
  try {
    await transition.ready
  } catch {
    await transition.finished.catch(() => {})
    canvas.remove()
    return
  }

  const frames = 48
  const keyframes = Array.from({ length: frames + 1 }, (_, n) => {
    const r = Math.max(0, revealRadius(n / frames, maxR) - SWITCH.tile * 3)
    return { clipPath: `circle(${r}px at ${origin.x}px ${origin.y}px)` }
  })
  const reveal = document.documentElement.animate(keyframes, {
    duration: SWITCH.durationMs,
    easing: 'linear',
    fill: 'forwards',
    pseudoElement: '::view-transition-new(root)',
  })

  let running = true
  if (ctx) {
    const paths = ditherPaths(SWITCH.tile)
    const palette = toDark ? TO_DARK : TO_LIGHT
    const frame = () => {
      if (!running) return
      // Follow the clip animation's own clock so the band and the circle stay locked together.
      const p = clamp(Number(reveal.currentTime ?? 0) / SWITCH.durationMs, 0, 1)
      drawBand(ctx, paths, palette, origin, w, h, dpr, p, revealRadius(p, maxR))
      if (p < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }
  await transition.finished.catch(() => {})
  running = false
  canvas.remove()
}
