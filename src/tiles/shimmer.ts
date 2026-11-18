import { clamp } from './flip'
import { LEVELS } from './dither'

/** Same hash as the approved mockups. Returns a value in [0, 1). */
export function hash2(i: number, j: number): number {
  let h = (i * 374761393 + j * 668265263) ^ 0x5bf03635
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** Boot-screen tile brightness in [0, 1]. */
export function bootLum(rip: number, jitter: number, calm: number, dim: number, turn: number): number {
  return clamp((0.3 + 0.42 * rip * rip + 0.1 * jitter) * calm * dim + 0.75 * turn * turn, 0, 1)
}

/** Shade level 0-4 for a brightness. */
export function levelOf(lum: number): number {
  return Math.min(LEVELS - 1, Math.floor(lum * LEVELS))
}
