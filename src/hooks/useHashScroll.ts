import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useHashScroll(): void {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = decodeURIComponent(hash.slice(1))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const deadline = Date.now() + 1000
    let raf = 0
    const tryScroll = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
        return
      }
      if (Date.now() < deadline) raf = requestAnimationFrame(tryScroll)
    }
    tryScroll()
    return () => cancelAnimationFrame(raf)
  }, [pathname, hash])
}
