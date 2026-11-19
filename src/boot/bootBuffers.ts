import { BOOT_PALETTE, paletteAt } from '../tiles/palette'

/**
 * Colour buckets along the boot palette walk. The old renderer used a 256-entry
 * table. Each of these 128 buckets is the mean of two old entries, so a tile's
 * colour stays within half an old table step.
 */
export const HUE_BUCKETS = 128

/** Sprites per atlas row. A 2D grid keeps the atlas under the browser's canvas size limit. */
export const ATLAS_COLS = 16
const ROWS_PER_LEVEL = Math.ceil(HUE_BUCKETS / ATLAS_COLS)

/** Bucket 0 to HUE_BUCKETS - 1 for a palette position. Wraps like paletteAt. */
export function hueBucket(hue: number): number {
  const w = ((hue % 1) + 1) % 1
  return Math.min(HUE_BUCKETS - 1, Math.floor(w * HUE_BUCKETS))
}

/** The CSS colour of one bucket, in whole RGB numbers like the old table. */
export function bucketColor(bucket: number): string {
  const [r, g, b] = paletteAt(BOOT_PALETTE, (bucket + 0.25) / HUE_BUCKETS)
  return `rgb(${r | 0},${g | 0},${b | 0})`
}

/** Top-left of the (shade level, colour bucket) sprite in the atlas, in atlas pixels. */
export function atlasCell(level: number, bucket: number, cell: number): { sx: number; sy: number } {
  return { sx: (bucket % ATLAS_COLS) * cell, sy: (level * ROWS_PER_LEVEL + Math.floor(bucket / ATLAS_COLS)) * cell }
}

/** Atlas size in pixels for a sprite cell size and a number of shade levels. */
export function atlasSize(levels: number, cell: number): { w: number; h: number } {
  return { w: ATLAS_COLS * cell, h: levels * ROWS_PER_LEVEL * cell }
}

/** Keeps a canvas when its size still fits; makes a new one only when the size changes. */
export function reuseCanvas<C extends { width: number; height: number }>(
  prev: C | undefined,
  w: number,
  h: number,
  create: (w: number, h: number) => C,
): C {
  return prev && prev.width === w && prev.height === h ? prev : create(w, h)
}

export type PixelRect = { x: number; y: number; w: number; h: number }

/**
 * A CSS-pixel box grown by a margin, snapped outward to whole device pixels.
 * Whole-pixel offsets keep text and shapes drawn into the buffer on the same
 * sub-pixel grid as when they were drawn full-screen.
 */
export function deviceRect(
  box: { left: number; top: number; right: number; bottom: number },
  margin: number,
  dpr: number,
): PixelRect {
  const x = Math.floor((box.left - margin) * dpr)
  const y = Math.floor((box.top - margin) * dpr)
  const r = Math.ceil((box.right + margin) * dpr)
  const b = Math.ceil((box.bottom + margin) * dpr)
  return { x, y, w: Math.max(1, r - x), h: Math.max(1, b - y) }
}
