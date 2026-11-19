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
