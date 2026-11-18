import { useEffect, useState } from 'react'

export function depthAt(scrollY: number, maxScroll: number): number {
  if (!(maxScroll > 0)) return 0
  return Math.min(1, Math.max(0, scrollY / maxScroll))
}

function read(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return depthAt(window.scrollY, max)
}

/** Scroll depth 0-1, rAF-throttled. Also writes --depth on <html>. */
export function useScrollDepth(): number {
  const [depth, setDepth] = useState(0)

  useEffect(() => {
    let frame = 0
    const apply = () => {
      frame = 0
      const d = read()
      document.documentElement.style.setProperty('--depth', d.toFixed(4))
      setDepth(d)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
      document.documentElement.style.removeProperty('--depth')
    }
  }, [])

  return depth
}
