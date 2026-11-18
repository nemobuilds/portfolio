import { render, screen, within, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi } from 'vitest'
import { Navbar } from './Navbar'
import { PhoneSectionBar } from './PhoneSectionBar'
import { Layout } from './Layout'
import Footer from './Footer'
import { ThemeProvider } from '../theme/ThemeProvider'
import { useHashScroll } from '../hooks/useHashScroll'

function wrap(ui: React.ReactNode, path = '/') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </ThemeProvider>,
  )
}

describe('Navbar', () => {
  test('brand link name starts with the visible text, then the full name (WCAG 2.5.3)', () => {
    wrap(<Navbar surface="home" />)
    const brand = screen.getByRole('link', { name: 'nemo, John Rogee Turqueza, home' })
    expect(brand).toHaveAttribute('href', '/')
    expect(brand).not.toHaveAttribute('aria-label')
    expect(brand.querySelector('.sr-only')).toHaveTextContent(', John Rogee Turqueza, home')
  })

  test('home pill is pale glass with ink text', () => {
    wrap(<Navbar surface="home" />)
    const pill = screen.getByRole('link', { name: 'nemo, John Rogee Turqueza, home' }).closest('.surface-glass')
    expect(pill).not.toBeNull()
    expect(pill!.className).toContain('text-[var(--ink)]')
    expect(pill!.className).not.toContain('cream')
  })

  test('current page is marked on /projects', () => {
    wrap(<Navbar surface="sub" current="projects" />, '/projects')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Certifications' })).not.toHaveAttribute('aria-current')
  })

  test('no current link on home or 404', () => {
    const { unmount } = wrap(<Navbar surface="home" />)
    expect(document.querySelector('[aria-current]')).toBeNull()
    unmount()
    wrap(<Navbar surface="sub" />, '/nope')
    expect(document.querySelector('[aria-current]')).toBeNull()
  })

  test('home has no theme toggle, subpages do', () => {
    const { unmount } = wrap(<Navbar surface="home" />)
    expect(screen.queryByRole('button', { name: /Switch to/ })).toBeNull()
    unmount()
    wrap(<Navbar surface="sub" />)
    expect(screen.getByRole('button', { name: /Switch to/ })).toBeInTheDocument()
  })

  test('resume link downloads', () => {
    wrap(<Navbar surface="home" />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Résumé' })).toHaveAttribute('download')
  })

  test('résumé is a rounded rectangle matching the pill, with a separator after the brand', () => {
    const { container } = wrap(<Navbar surface="home" />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Résumé' }).className).toContain('!rounded-[18px]')
    expect(container.querySelector('span[aria-hidden="true"].w-px')).not.toBeNull()
  })

  test('back link shows only when asked and points to /projects', () => {
    const { unmount } = wrap(<Navbar surface="sub" />)
    expect(screen.queryByRole('link', { name: /All projects/ })).toBeNull()
    unmount()
    wrap(<Navbar surface="sub" backLink />)
    expect(screen.getByRole('link', { name: /All projects/ })).toHaveAttribute('href', '/projects')
  })

  test('phone menu: Esc closes and focus returns to the menu button', async () => {
    const user = userEvent.setup()
    wrap(<Navbar surface="home" />)
    const menu = screen.getByRole('button', { name: 'Open menu' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    expect(menu).toHaveAttribute('aria-controls', 'site-menu')
    await user.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById('site-menu')).not.toBeNull()
    await user.keyboard('{Escape}')
    expect(document.getElementById('site-menu')).toBeNull()
    expect(menu).toHaveFocus()
  })

  test('back link is not rendered while the phone menu is open', async () => {
    const user = userEvent.setup()
    wrap(<Navbar surface="sub" backLink />)
    expect(screen.getByRole('link', { name: /All projects/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.queryByRole('link', { name: /All projects/ })).toBeNull()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('link', { name: /All projects/ })).toBeInTheDocument()
  })

  test('phone menu traps Tab', async () => {
    const user = userEvent.setup()
    wrap(<Navbar surface="home" />)
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const card = document.getElementById('site-menu')!
    const close = within(card).getByRole('button', { name: 'Close menu' })
    const resume = within(card).getByRole('link', { name: 'Résumé (PDF)' })
    expect(close).toHaveFocus()
    resume.focus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(resume).toHaveFocus()
  })
})

describe('PhoneSectionBar', () => {
  test('Certs item name keeps the visible text and adds Certifications (WCAG 2.5.3)', () => {
    wrap(
      <PhoneSectionBar
        items={[
          { label: 'Projects', to: '#projects' },
          { label: 'Certs', to: '#certificates', srText: ', Certifications' },
        ]}
      />,
    )
    const bar = screen.getByRole('navigation', { name: 'Page sections' })
    const certs = within(bar).getByRole('link', { name: 'Certs, Certifications' })
    expect(certs).toHaveAttribute('href', '#certificates')
    expect(certs).not.toHaveAttribute('aria-label')
    expect(within(bar).getByRole('link', { name: 'Projects' })).toBeInTheDocument()
  })

  test('the home phone bar labels Certs with Certifications', () => {
    wrap(
      <Layout surface="home">
        <p>x</p>
      </Layout>,
    )
    const bar = screen.getByRole('navigation', { name: 'Page sections' })
    expect(within(bar).getByRole('link', { name: 'Certs, Certifications' })).toHaveAttribute('href', '#certificates')
  })
})

describe('Layout', () => {
  test('sets data-surface, renders skip link, main and footer', () => {
    wrap(
      <Layout surface="sub">
        <h1>Hi</h1>
      </Layout>,
    )
    expect(document.documentElement.dataset.surface).toBe('sub')
    expect(screen.getAllByRole('link')[0]).toHaveTextContent('Skip to content')
    expect(document.querySelector('main#main-content h1')).not.toBeNull()
    expect(screen.getByText(/Nemo is still building\./)).toBeInTheDocument()
    expect(screen.getByText(`© ${new Date().getFullYear()} John Rogee Turqueza`)).toBeInTheDocument()
  })

  test('pads the page bottom for the phone section bar, so the footer stays above it', () => {
    wrap(
      <Layout surface="home">
        <h1>Hi</h1>
      </Layout>,
    )
    const page = document.querySelector('main#main-content')!.parentElement!
    expect(page.className).toContain('pb-[calc(44px+env(safe-area-inset-bottom))]')
    expect(page.className).toContain('min-[760px]:pb-0')
    expect(page.lastElementChild).toHaveAttribute('aria-label', 'Page sections')
    expect(document.querySelector('main#main-content')!.className).not.toMatch(/(^|\s)pb-/)
  })

  test('skip link moves focus to the h1', async () => {
    const user = userEvent.setup()
    wrap(
      <Layout surface="sub">
        <h1>Hi</h1>
      </Layout>,
    )
    await user.click(screen.getByRole('link', { name: 'Skip to content' }))
    expect(screen.getByRole('heading', { name: 'Hi' })).toHaveFocus()
  })

  test('forceTheme overrides data-theme and restores it on unmount', async () => {
    localStorage.setItem('theme', 'light')
    function Host({ show }: { show: boolean }) {
      return show ? (
        <Layout surface="sub" forceTheme="dark">
          <h1>x</h1>
        </Layout>
      ) : null
    }
    const { rerender } = render(
      <ThemeProvider>
        <MemoryRouter>
          <Host show />
        </MemoryRouter>
      </ThemeProvider>,
    )
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'))
    rerender(
      <ThemeProvider>
        <MemoryRouter>
          <Host show={false} />
        </MemoryRouter>
      </ThemeProvider>,
    )
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'))
    expect(localStorage.getItem('theme')).toBe('light')
  })
})

describe('forced theme', () => {
  test('forced layout has no toggle and is dark on the first render', () => {
    localStorage.setItem('theme', 'light')
    wrap(
      <Layout surface="sub" forceTheme="dark">
        <h1>x</h1>
      </Layout>,
    )
    expect(screen.queryByRole('button', { name: /Switch to/ })).toBeNull()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  test('forceTheme layout renders no theme toggle', async () => {
    wrap(
      <Layout surface="sub" forceTheme="dark">
        <h1>x</h1>
      </Layout>,
    )
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'))
    expect(screen.queryByRole('button', { name: /Switch to/ })).toBeNull()
  })
})

describe('Footer', () => {
  test('renders copyright and tagline', () => {
    render(<Footer />)
    expect(screen.getByText('Nemo is still building.')).toBeInTheDocument()
  })

  test('home footer sits on the abyss, so it uses pale text; subpages keep secondary ink', () => {
    const { container, unmount } = render(<Footer surface="home" />)
    expect(container.querySelector('footer')!.className).toContain('text-[#B9C3E8]')
    unmount()
    const sub = render(<Footer surface="sub" />)
    expect(sub.container.querySelector('footer')!.className).toContain('text-[var(--text-secondary)]')
  })
})

describe('useHashScroll', () => {
  test('scrolls to #experience after it mounts late', async () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    function Probe() {
      useHashScroll()
      return null
    }
    wrap(<Probe />, '/#experience')
    expect(scrollIntoView).not.toHaveBeenCalled()
    setTimeout(() => {
      const el = document.createElement('section')
      el.id = 'experience'
      document.body.appendChild(el)
    }, 50)
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1), { timeout: 1500 })
    document.getElementById('experience')?.remove()
    await act(async () => {})
  })
})
