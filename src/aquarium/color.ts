type RGB = [number, number, number]

function toRGB(c: string): RGB {
  if (c[0] === '#') {
    const h = c.length === 4 ? [...c.slice(1)].map((x) => x + x).join('') : c.slice(1)
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB
  }
  return (c.match(/\d+(?:\.\d+)?/g) ?? ['0', '0', '0']).slice(0, 3).map(Number) as RGB
}

/** Blend a toward b by t (0 = a, 1 = b). Accepts #rrggbb, #rgb or rgb(). */
export function mix(a: string, b: string, t: number): string {
  const pa = toRGB(a)
  const pb = toRGB(b)
  return 'rgb(' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',') + ')'
}

/** Depth fog: 0 (near) is 8% toward the water colour, 1 (far) is 70%. */
export function fogged(color: string, water: string, depth: number): string {
  const d = Math.max(0, Math.min(1, depth))
  return mix(color, water, 0.08 + d * 0.62)
}
