import { useSyncExternalStore } from 'react'

export function depthAt(scrollY: number, maxScroll: number): number {
  if (!(maxScroll > 0)) return 0
  return Math.min(1, Math.max(0, scrollY / maxScroll))
}

function read(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return depthAt(window.scrollY, max)
}

// One shared scroll subscription for every caller. Each separate reader would
// read scrollHeight after another wrote --depth, which forces a full style
// recalculation per reader per frame.
let depth = 0
let frame = 0
const listeners = new Set<() => void>()

function apply() {
  frame = 0
  depth = read()
  document.documentElement.style.setProperty('--depth', depth.toFixed(4))
  listeners.forEach((l) => l())
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(apply)
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    apply()
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size) return
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    document.documentElement.style.removeProperty('--depth')
  }
}

const snapshot = () => depth

/** Scroll depth 0-1, rAF-throttled. Also writes --depth on <html>. */
export function useScrollDepth(): number {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}
