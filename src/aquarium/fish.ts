export type Fish = {
  /** Nose position in px. The body extends to the left of it. */
  x: number
  y: number
  /** 0 near .. 1 far */
  depth: number
  /** px per second after depth scaling */
  speed: number
  phase: number
  /** Size multiplier; body length is fishLength(f) */
  scale: number
  /** Slow-down from personal space, 1 = none */
  ease?: number
  /** Whole-sprite opacity, eased toward VEIL_MIN while the fish overlaps a control or heading. */
  veil?: number
}

/** Opacity of a sprite (fish, bubble or cloud) while it passes a control, heading or card. */
export const VEIL_MIN = 0.25
/** Seconds for a sprite to fade fully down or back up. */
export const VEIL_S = 0.3

/**
 * Moves a sprite's opacity toward its target at a steady rate, so the whole sprite fades
 * over VEIL_S instead of jumping. The shape itself is never clipped.
 */
export function easeVeil(current: number, target: number, dt: number): number {
  const step = ((1 - VEIL_MIN) * dt) / VEIL_S
  if (current < target) return Math.min(target, current + step)
  return Math.max(target, current - step)
}

export type Box = { left: number; top: number; right: number; bottom: number }

/** True when the box overlaps any of the rects (viewport px). */
export function boxHitsAny(box: Box, rects: readonly Box[]): boolean {
  return rects.some((r) => box.right > r.left && box.left < r.right && box.bottom > r.top && box.top < r.bottom)
}

/** The fish's on-screen box: the same cells the renderer draws. */
export function fishBox(f: Fish): Box {
  const L = fishLength(f)
  const h = fishHalfHeight(f) * 1.8
  return { left: f.x - L - CELL, top: f.y - h, right: f.x + CELL, bottom: f.y + h }
}

export type Bounds = { width: number; height: number }
type Rng = () => number

export const CELL = 14
/** Radians; negative y is up. Mostly rightward with a slow rise. */
export const CURRENT = -0.2
const BASE_CELLS = 12
const DEPTH_SIZE = 0.38
const DEPTH_SLOW = 0.42
const PERSONAL_DEPTH = 0.2
const CANDIDATES = 5

export function fishCount(width: number, height: number): number {
  if (width < 760) return 2
  return Math.max(3, Math.min(4, Math.round((width * height) / 400000)))
}

export const fishLength = (f: Fish): number => Math.round(BASE_CELLS * f.scale) * CELL
export const fishHalfHeight = (f: Fish): number => fishLength(f) * 0.19

export function makeFish(rng: Rng, bounds: Bounds, depth: number): Fish {
  const cells = 10 + rng() * 7
  const speed = (50 + rng() * 30) * (1 - DEPTH_SLOW * depth)
  const phase = rng() * 10
  return {
    x: rng() * bounds.width,
    y: rng() * bounds.height,
    depth,
    speed,
    phase,
    scale: (cells * (1 - DEPTH_SIZE * depth)) / BASE_CELLS,
  }
}

export function stepFish(f: Fish, dt: number, t: number): void {
  const a = CURRENT + Math.sin(t * 0.35 + f.phase) * 0.22 + Math.sin(t * 0.9 + f.phase * 2) * 0.07
  const v = f.speed * (f.ease ?? 1)
  f.x += Math.cos(a) * v * dt
  f.y += Math.sin(a) * v * dt
}

/** True once the tail has left through the right or top edge, or a hard scroll pushed it far out. */
export function needsRespawn(f: Fish, bounds: Bounds): boolean {
  const L = fishLength(f)
  return f.x - L > bounds.width + L * 0.8 || f.y < -L * 0.8 || f.y > bounds.height + L * 3 || f.x < -L * 4
}

export function respawn(f: Fish, fishes: Fish[], bounds: Bounds, rng: Rng): void {
  const x = -CELL
  let bestY = bounds.height * 0.12
  let bestD = -1
  for (let k = 0; k < CANDIDATES; k++) {
    const y = bounds.height * 0.12 + rng() * bounds.height * 0.84
    let d = Infinity
    for (const o of fishes) if (o !== f) d = Math.min(d, Math.hypot(o.x - x, o.y - y))
    if (d > bestD) {
      bestD = d
      bestY = y
    }
  }
  f.x = x
  f.y = bestY
}

const NX = -Math.sin(CURRENT)
const NY = Math.cos(CURRENT)
const FX = Math.cos(CURRENT)
const FY = Math.sin(CURRENT)

/** Fish at a similar depth side-step across the current; the one behind eases off. */
export function separate(fishes: Fish[], dt: number): void {
  for (const f of fishes) f.ease = 1
  for (let a = 0; a < fishes.length; a++) {
    for (let b = a + 1; b < fishes.length; b++) {
      const fa = fishes[a]
      const fb = fishes[b]
      if (Math.abs(fa.depth - fb.depth) > PERSONAL_DEPTH) continue
      const ca = { x: fa.x - fishLength(fa) / 2, y: fa.y }
      const cb = { x: fb.x - fishLength(fb) / 2, y: fb.y }
      const dx = cb.x - ca.x
      const dy = cb.y - ca.y
      const minD = (fishLength(fa) + fishLength(fb)) * 0.55 + (fishHalfHeight(fa) + fishHalfHeight(fb))
      const d = Math.hypot(dx, dy)
      if (d >= minD) continue
      const side = dx * NX + dy * NY >= 0 ? 1 : -1
      const push = (minD - d) * Math.min(1, dt * 2.5) * 0.5
      fa.x -= NX * side * push
      fa.y -= NY * side * push
      fb.x += NX * side * push
      fb.y += NY * side * push
      const behind = dx * FX + dy * FY > 0 ? fa : fb
      behind.ease = Math.min(behind.ease ?? 1, 0.55 + (0.45 * d) / minD)
    }
  }
}

/** Clownfish live on shallow reefs: full until 0.42 scroll depth, gone by 0.62. */
export function clownfishAlpha(scrollDepth: number): number {
  return Math.max(0, Math.min(1, 1 - (scrollDepth - 0.42) / 0.2))
}
