// Clouds in the hero sky, drawn with the same tiles as the fish: a filled tile plus a
// darker glyph. Owner's pick (option C): one band of four clouds just under the navbar,
// all drifting right at the same speed, about 50 s for one crossing.

/** [fill, glyph ink, glyphs]. The glyph flips between the listed ones as the cloud shimmers. */
export type CloudTile = { fill: string; ink: string; glyphs: readonly string[] }

// Sky palette: mostly white and pale blue, some light grey, a few cream; a grey underside.
export const CLOUD_TILES = {
  white: { fill: '#FFFFFF', ink: '#C3CDE2', glyphs: ['+', '='] },
  pale: { fill: '#DCE7F7', ink: '#93A9D3', glyphs: ['~', '-'] },
  grey: { fill: '#E3E7EE', ink: '#9AA4B8', glyphs: ['=', ':'] },
  cream: { fill: '#F6EFE2', ink: '#B9AE98', glyphs: [':', '+'] },
  under: { fill: '#C9D3E6', ink: '#8796B5', glyphs: ['%', '#'] },
} as const satisfies Record<string, CloudTile>

// '#' = cloud body (tile picked per cell), 'U' = underside, ' ' = empty.
export const CLOUD_SHAPES = {
  small: ['   ###   ', ' ####### ', '#########', ' UUUUUUU '],
  med: ['     ####     ', '  ##########  ', ' ############ ', '##############', ' UUUUUUUUUUUU '],
} as const

type ShapeName = keyof typeof CLOUD_SHAPES

/** One crossing of the screen, in seconds. */
export const CLOUD_CROSSING_S = 50
/** Seconds between shimmer steps (glyph flips). */
export const SHIMMER_S = 0.9
/** Cloud tile size in px: the fish cell on wide screens, smaller on phones. */
export const cloudCell = (width: number) => (width < 760 ? 10 : 14)

// The band: [shape, start position as a share of the loop, rows down from the band top].
const BAND: readonly [ShapeName, number, number][] = [
  ['med', 0, 0],
  ['small', 0.26, 2],
  ['med', 0.5, 1],
  ['small', 0.76, 2],
]

/** veil: the whole cloud's opacity, eased down while it passes text (the cloud is never clipped). */
export type Cloud = { shape: ShapeName; x: number; row: number; seed: number; veil?: number }

export const shapeCols = (shape: ShapeName) => Math.max(...CLOUD_SHAPES[shape].map((r) => r.length))
export const shapeRows = (shape: ShapeName) => CLOUD_SHAPES[shape].length

/** Rows of tiles the band needs from its top to the bottom of its lowest cloud. */
export const bandRows = () => Math.max(...BAND.map(([s, , row]) => row + shapeRows(s)))

/** Height of the cloud band in px at the full tile size, so callers can keep it clear of the text. */
export function bandHeight(width: number): number {
  return bandRows() * cloudCell(width)
}

/** Smallest tile that still reads as a cloud; below this the band is hidden. */
export const MIN_CLOUD_CELL = 6

/**
 * The tile size that fits the band into `space` px (the gap between the navbar and the
 * hero's first line of text): the normal size when it fits, smaller when it does not,
 * and 0 (no clouds) when even the smallest tile would overlap the text.
 */
export function fitCell(width: number, space: number): number {
  const cell = Math.min(cloudCell(width), Math.floor(space / bandRows()))
  return cell >= MIN_CLOUD_CELL ? cell : 0
}

/** Total loop length in px: the screen width plus room for the widest cloud to leave and re-enter. */
export function loopLength(width: number): number {
  return width + shapeCols('med') * cloudCell(width)
}

/** The four clouds, spread evenly along the loop. x is the cloud's left edge in px. */
export function makeClouds(width: number): Cloud[] {
  const loop = loopLength(width)
  const pad = shapeCols('med') * cloudCell(width)
  return BAND.map(([shape, share, row], i) => ({ shape, x: share * loop - pad, row, seed: 11 + i }))
}

/** px per second, the same for every cloud, so the band moves as one strip. */
export const cloudSpeed = (width: number) => loopLength(width) / CLOUD_CROSSING_S

/** Moves every cloud right; a cloud that leaves on the right comes back in from the left. */
export function stepClouds(clouds: Cloud[], dt: number, width: number): void {
  const loop = loopLength(width)
  const v = cloudSpeed(width)
  for (const c of clouds) {
    c.x += v * dt
    if (c.x > width) c.x -= loop
  }
}

function hash(a: number, b: number, s: number): number {
  let h = (a * 374761393 + b * 668265263 + s * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

function bodyTile(r: number): CloudTile {
  if (r < 0.5) return CLOUD_TILES.white
  if (r < 0.85) return CLOUD_TILES.pale
  if (r < 0.95) return CLOUD_TILES.grey
  return CLOUD_TILES.cream
}

export type CloudCell = { col: number; row: number; tile: CloudTile; glyph: string }

/**
 * The tiles of one cloud at shimmer step `step`. Tile colours never change; on each
 * step about one tile in six shows its other glyph, like the fish's beating fin.
 */
export function cloudCells(cloud: Cloud, step: number): CloudCell[] {
  const rows = CLOUD_SHAPES[cloud.shape]
  const out: CloudCell[] = []
  rows.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      const ch = line[col]
      if (ch === ' ') continue
      const r = hash(col, row, cloud.seed)
      const tile = ch === 'U' ? CLOUD_TILES.under : bodyTile(r)
      const flip = Math.floor(hash(col + step, row, cloud.seed) * 6) === 0 ? 1 : 0
      out.push({ col, row, tile, glyph: tile.glyphs[(Math.floor(r * 10) + flip) % tile.glyphs.length] })
    }
  })
  return out
}

/**
 * How much a fish fades at viewport y, given the surface line: fully hidden above it
 * (that is the sky), fully visible `fade` px below it. Mirrors the grid's own fade.
 */
export function skyFade(y: number, surfaceY: number, fade: number): number {
  if (y <= surfaceY) return 1
  if (y >= surfaceY + fade) return 0
  return 1 - (y - surfaceY) / fade
}
