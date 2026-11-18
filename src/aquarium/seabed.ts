import { seeded } from './rng'

export const SEABED_ROWS = 20

const sandHeight = (c: number) =>
  Math.max(2, Math.round(3.3 + 1.3 * Math.sin(c * 0.13 + 0.6) + 0.9 * Math.sin(c * 0.31 + 2.1)))

/** Glyph grid, row 0 on top. ' ' is empty. Sand : . , rocks # shells @ u kelp ( ) */
export function buildSeabed(cols: number, seed: number): string[][] {
  const rng = seeded(seed)
  const grid: string[][] = Array.from({ length: SEABED_ROWS }, () => Array<string>(cols).fill(' '))
  const set = (c: number, r: number, ch: string) => {
    if (c >= 0 && c < cols && r >= 0 && r < SEABED_ROWS) grid[r][c] = ch
  }
  const top = (c: number) => SEABED_ROWS - sandHeight(c)

  const wide = cols > 60
  const kelp: [number, number][] = wide
    ? [[0.3, 4], [0.58, 7], [0.62, 12], [0.8, 9], [0.84, 15], [0.87, 6], [0.93, 11]]
    : [[0.56, 7], [0.68, 12], [0.86, 9]]
  kelp.forEach(([f, n], q) => {
    const c = Math.round(f * cols)
    const base = top(c)
    for (let i = 1; i <= n; i++) set(c + Math.round(Math.sin(i * 0.55 + q) * 0.8), base - i, (i + q) % 2 ? ')' : '(')
  })

  const rock = (f: number, shape: string[]) => {
    const c0 = Math.round(f * cols)
    shape.forEach((row, j) =>
      [...row].forEach((ch, i) => {
        if (ch === '#') set(c0 + i, top(c0 + i) - shape.length + j + 1, '#')
      }),
    )
  }
  rock(0.44, [' ## ', '####'])
  rock(0.72, ['#  ', '###'])

  for (let c = 0; c < cols; c++) {
    const h = sandHeight(c)
    for (let k = 0; k < h; k++) {
      const crest = k === h - 1
      const q = rng()
      set(c, SEABED_ROWS - 1 - k, crest ? (q < 0.3 ? ':' : '.') : q < 0.45 ? ':' : q < 0.8 ? '.' : ',')
    }
  }

  const shells: [number, string][] = [[0.38, '@'], [0.67, 'u'], [0.52, '@']]
  shells.forEach(([f, ch]) => {
    const c = Math.round(f * cols)
    set(c, top(c) - 1, ch)
  })
  return grid
}
