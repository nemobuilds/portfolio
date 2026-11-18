export type Cell = 'body' | 'rim' | 'band' | 'edge' | 'fin' | 'tail' | 'tailEdge' | 'eye' | null

/** Body half-height at u (0 tail tip .. 1 nose), in body half-heights. */
function bodyHeight(u: number): number {
  if (u < 0.2 || u > 1) return 0
  const w = (u - 0.2) / 0.8
  const h = Math.pow(Math.sin(Math.PI * Math.min(1, w * 0.92 + 0.05)), 0.72) * (w > 0.8 ? 1 - 0.25 * ((w - 0.8) / 0.2) : 1)
  return w < 0.16 ? Math.max(h, 0.3) : h
}

const bump = (x: number, a: number, b: number) => (x <= a || x >= b ? 0 : Math.sin((Math.PI * (x - a)) / (b - a)))

/**
 * What sits in a cell of a side-view clownfish.
 * u: 0 tail tip .. 1 nose. v: in body half-heights, negative is up.
 */
export function sideClassify(u: number, v: number, t: number, phase: number): Cell {
  const beat = Math.sin(t * 7 + phase)
  const wave = Math.sin(t * 6 + phase - u * 6) * 0.07 * Math.max(0, 0.6 - u)
  const vv = v - wave
  const span = 0.2 * (0.62 + 0.38 * Math.abs(beat))
  if (u < 0.2 && u > 0.2 - span) {
    const k = (0.2 - u) / span
    const half = (0.3 + 0.62 * Math.pow(k, 0.8)) * (k > 0.78 ? Math.sqrt(Math.max(0, 1 - Math.pow((k - 0.78) / 0.22, 2))) : 1)
    const tv = vv - beat * 0.1 * k
    if (Math.abs(tv) < half) return k > 0.82 || Math.abs(tv) > half - 0.16 ? 'tailEdge' : 'tail'
    return null
  }
  const b = bodyHeight(u)
  if (b > 0 && Math.abs(vv) < b) {
    if (u > 0.86 && u < 0.93 && vv > -0.55 && vv < -0.05) return 'eye'
    const r = vv / b
    for (const c of [0.275, 0.535 - 0.035 * r, 0.8 - 0.04 * r * r]) {
      const d = Math.abs(u - c)
      if (d < 0.03) return 'band'
      if (d < 0.052) return 'edge'
    }
    return Math.abs(r) > 0.78 ? 'rim' : 'body'
  }
  if (vv < 0 && u > 0.36 && u < 0.8) {
    const f = u < 0.53 ? 0.36 * Math.pow(bump(u, 0.35, 0.54), 0.6) : 0.58 * Math.pow(bump(u, 0.52, 0.8), 0.7)
    const out = -vv - b
    if (out > 0 && out < f) return out > f - 0.14 ? 'edge' : 'fin'
  }
  if (vv > 0) {
    const out = vv - b
    const f = Math.max(0.44 * Math.pow(bump(u, 0.33, 0.52), 0.7), 0.32 * Math.pow(bump(u, 0.6, 0.71), 0.7))
    if (out > 0 && out < f) return out > f - 0.14 ? 'edge' : 'fin'
  }
  return null
}
