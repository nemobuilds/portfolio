import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHashScroll } from '../hooks/useHashScroll'
import { useTheme } from '../theme/ThemeProvider'
import Footer from './Footer'
import { Navbar } from './Navbar'
import { PhoneSectionBar, type PhoneSectionItem } from './PhoneSectionBar'
import { SkipLink } from './SkipLink'

type Props = {
  surface: 'home' | 'sub'
  current?: 'projects' | 'certifications'
  backLink?: boolean
  forceTheme?: 'dark'
  children: ReactNode
}

const homeItems: PhoneSectionItem[] = [
  { label: 'Projects', to: '#projects' },
  { label: 'Experience', to: '#experience' },
  { label: 'Certs', to: '#certificates', ariaLabel: 'Certifications' },
  { label: 'Contact', to: '#contact' },
]

export function Layout({ surface, current, backLink, forceTheme, children }: Props) {
  const { theme } = useTheme()
  const navigate = useNavigate()
  useHashScroll()

  useLayoutEffect(() => {
    document.documentElement.dataset.surface = surface
  }, [surface])

  // ThemeProvider writes data-theme from a later effect, so watch the attribute while forced.
  useEffect(() => {
    if (!forceTheme) return
    const root = document.documentElement
    const apply = () => {
      if (root.dataset.theme !== forceTheme) root.dataset.theme = forceTheme
    }
    apply()
    const observer = new MutationObserver(apply)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      observer.disconnect()
      root.dataset.theme = theme
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceTheme])

  const subItems: PhoneSectionItem[] = [
    {
      label: 'Back',
      to: '/',
      onClick: (e) => {
        if (window.history.state?.idx > 0) {
          e.preventDefault()
          navigate(-1)
        }
      },
    },
    { label: 'Projects', to: '/projects' },
    { label: 'Contact', to: '/#contact' },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Navbar surface={surface} current={current} backLink={backLink} />
      <main id="main-content" className={`flex-1 ${surface === 'sub' ? 'pt-24' : ''} pb-14 min-[760px]:pb-0`}>
        {children}
      </main>
      <Footer />
      <PhoneSectionBar items={surface === 'home' ? homeItems : subItems} />
    </div>
  )
}
