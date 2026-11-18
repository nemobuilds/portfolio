import { useLayoutEffect, type ReactNode } from 'react'
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
  const { setForcedTheme } = useTheme()
  const navigate = useNavigate()
  useHashScroll()

  useLayoutEffect(() => {
    document.documentElement.dataset.surface = surface
  }, [surface])

  useLayoutEffect(() => {
    if (!forceTheme) return
    setForcedTheme(forceTheme)
    return () => setForcedTheme(null)
  }, [forceTheme, setForcedTheme])

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
      <Navbar surface={surface} current={current} backLink={backLink} hideThemeToggle={!!forceTheme} />
      <main id="main-content" className={`flex-1 ${surface === 'sub' ? 'pt-24' : ''} pb-14 min-[760px]:pb-0`}>
        {children}
      </main>
      <Footer surface={surface} />
      <PhoneSectionBar items={surface === 'home' ? homeItems : subItems} />
    </div>
  )
}
