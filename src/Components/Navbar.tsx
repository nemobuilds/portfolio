import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../content/site'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { Avatar } from './Avatar'
import { BackLink } from './BackLink'
import { Button } from './Button'
import { Icon } from './Icon'
import ThemeToggle from './ThemeToggle'

type Props = {
  surface: 'home' | 'sub'
  current?: 'projects' | 'certifications'
  backLink?: boolean
  hideThemeToggle?: boolean
}

const links = [
  { key: 'projects', label: 'Projects', to: '/projects' },
  { key: 'experience', label: 'Experience', to: '/#experience' },
  { key: 'certifications', label: 'Certifications', to: '/certificates' },
] as const

export function Navbar({ surface, current, backLink, hideThemeToggle }: Props) {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const isHome = surface === 'home'

  useFocusTrap(card, open)

  useEffect(() => {
    if (open) {
      closeButton.current?.focus()
    } else if (wasOpen.current) {
      menuButton.current?.focus()
    }
    wasOpen.current = open
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const pillSurface = isHome ? 'surface-glass text-[var(--ink)]' : 'surface-slate'
  const linkBase =
    'relative inline-flex min-h-11 items-center px-3 text-[14px] font-semibold no-underline text-inherit hover:underline'

  return (
    <header className={`pointer-events-none fixed inset-x-0 z-50 ${isHome ? 'top-4' : 'top-3'}`}>
      <div className={`relative mx-auto flex w-full max-w-[1200px] items-center px-4 ${backLink && !isHome ? 'justify-between min-[760px]:justify-center' : 'justify-center'}`}>
        {backLink && !isHome && !open && (
          <div className="min-[760px]:absolute min-[760px]:left-4">
            <BackLink />
          </div>
        )}
        <div className={`pointer-events-auto rounded-[24px] ${pillSurface} ${open ? 'w-full max-w-[420px]' : ''}`}>
          <div className="flex items-center gap-1 py-1 pl-2 pr-2">
            <Link
              to="/"
              aria-label={`${site.name}, home`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full pr-3 text-[15px] font-bold no-underline text-inherit"
            >
              <span className="min-[760px]:hidden"><Avatar size={28} /></span>
              <span className="hidden min-[760px]:inline-flex"><Avatar size={32} /></span>
              <span>{site.brand}</span>
            </Link>

            <nav aria-label="Main" className="hidden items-center gap-1 min-[760px]:flex">
              {links.map((l) => {
                const isCurrent = !isHome && current === l.key
                return (
                  <Link
                    key={l.key}
                    to={l.to}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`${linkBase} ${isCurrent ? 'underline decoration-[#F06A16] decoration-2 underline-offset-8' : ''}`}
                  >
                    {l.label}
                  </Link>
                )
              })}
              <Button variant="primary" href={site.resumePath} download label="Résumé" />
            </nav>

            {!isHome && !hideThemeToggle && <ThemeToggle />}

            <button
              ref={menuButton}
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(true)}
              className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-inherit min-[760px]:hidden ${open ? 'hidden' : ''}`}
            >
              <Icon name="menu" />
            </button>
          </div>

          {open && (
            <div id="site-menu" ref={card} className="flex flex-col gap-1 px-2 pb-3">
              <button
                ref={closeButton}
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center self-end rounded-full border-0 bg-transparent text-inherit"
              >
                <Icon name="close" />
              </button>
              {links.map((l) => {
                const isCurrent = !isHome && current === l.key
                return (
                  <Link
                    key={l.key}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    aria-current={isCurrent ? 'page' : undefined}
                    className="flex min-h-12 items-center rounded-lg px-3 text-[16px] font-semibold no-underline text-inherit"
                  >
                    {l.label}
                  </Link>
                )
              })}
              <Button variant="primary" href={site.resumePath} download label="Résumé (PDF)" />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
