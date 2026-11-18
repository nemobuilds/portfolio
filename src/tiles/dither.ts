export const LEVELS = 5

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

/** Indexes 0-15 of the 4x4 cells that are on for a shade level (0 to LEVELS - 1). */
export function ditherCells(level: number): number[] {
  const on = Math.round(((level + 1) / LEVELS) * 16)
  const cells: number[] = []
  for (let q = 0; q < 16; q++) if (BAYER[q] < on) cells.push(q)
  return cells
}

/** One Path2D per level, centred on 0,0. Browser only (needs Path2D). */
export function ditherPaths(tile: number): Path2D[] {
  const inner = tile - 2
  const sub = inner / 4
  const dot = sub - 0.6
  const paths: Path2D[] = []
  for (let l = 0; l < LEVELS; l++) {
    const p = new Path2D()
    if (l === LEVELS - 1) p.roundRect(-inner / 2, -inner / 2, inner, inner, 2)
    else
      for (const q of ditherCells(l))
        p.rect(-inner / 2 + (q % 4) * sub + 0.3, -inner / 2 + Math.floor(q / 4) * sub + 0.3, dot, dot)
    paths.push(p)
  }
  return paths
}
