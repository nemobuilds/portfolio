import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// /certificates and /certificates/:id are one page; the :id only opens the dialog.
const isCertificates = (path: string) => /^\/certificates(\/[^/]+)?\/?$/.test(path)

/**
 * A new page starts at the top. Back/forward (POP) keeps the browser's restored
 * position, a hash link is left to useHashScroll, and the certificate dialog
 * keeps the list where it was.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const type = useNavigationType()
  const previous = useRef(pathname)

  useLayoutEffect(() => {
    const from = previous.current
    previous.current = pathname
    if (from === pathname || hash || type === 'POP') return
    if (isCertificates(from) && isCertificates(pathname)) return
    window.scrollTo(0, 0)
  }, [pathname, hash, type])

  return null
}
