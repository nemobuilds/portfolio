import { useSyncExternalStore } from 'react'

export function depthAt(scrollY: number, maxScroll: number): number {
  if (!(maxScroll > 0)) return 0
  return Math.min(1, Math.max(0, scrollY / maxScroll))
}

function read(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return depthAt(window.scrollY, max)
}

// One shared scroll subscription for every caller: one scroll listener and one
// scrollHeight read per frame, however many components ask for the depth.
let depth = 0
let frame = 0
const listeners = new Set<() => void>()

function apply() {
  frame = 0
  depth = read()
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
    depth = 0
  }
}

// With no subscribers the cached value may be stale (a remount after a deep
// scroll), so read live until the first subscription.
const snapshot = () => (listeners.size ? depth : read())

/** Scroll depth 0-1, rAF-throttled, shared by every caller. */
export function useScrollDepth(): number {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}
