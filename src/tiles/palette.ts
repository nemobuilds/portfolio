export const BOOT_PALETTE = ['#E9F0F9', '#93B1E6', '#3557C2', '#3C528C', '#93B1E6', '#3557C2', '#3C528C', '#93B1E6', '#FF9A52', '#3557C2', '#3C528C', '#93B1E6']
export const TO_DARK = ['#3557C2', '#93B1E6', '#3C528C', '#5B7BD8', '#E9F0F9', '#FF9A52']
export const TO_LIGHT = ['#3557C2', '#93B1E6', '#22345F', '#5B7BD8', '#3C528C', '#F06A16']

function hexRGB(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16)
  return [n >> 16, (n >> 8) & 255, n & 255]
}

/** Smooth walk around the palette. x wraps, so 1 equals 0. */
export function paletteAt(list: string[], x: number): [number, number, number] {
  const rgb = list.map(hexRGB)
  const w = ((x % 1) + 1) % 1
  const f = w * rgb.length
  const i = Math.floor(f)
  const t = f - i
  const a = rgb[i]
  const b = rgb[(i + 1) % rgb.length]
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}
