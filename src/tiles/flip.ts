export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const smoothstep = (k: number) => k * k * (3 - 2 * k)

/** Flip progress for one tile. Distances are in tiles. */
export function flipState(dist: number, front: number, jitter: number, band: number) {
  const k = clamp((front - dist - jitter) / band, 0, 1)
  const flip = smoothstep(k) * Math.PI
  return { k, squash: Math.abs(Math.cos(flip)), turn: Math.sin(flip) }
}
