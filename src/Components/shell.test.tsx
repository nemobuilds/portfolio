import { render, screen, within, waitFor, act, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi, afterEach } from 'vitest'
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

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('data-surface')
})

describe('Navbar', () => {
  test('brand link has the full-name label', () => {
    wrap(<Navbar surface="home" />)
    const brand = screen.getByRole('link', { name: 'John Rogee Turqueza, home' })
    expect(brand).toHaveAttribute('href', '/')
    expect(brand).toHaveTextContent('nemo')
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
  test('Certs item has the Certifications label', () => {
    wrap(
      <PhoneSectionBar
        items={[
          { label: 'Projects', to: '#projects' },
          { label: 'Certs', to: '#certificates', ariaLabel: 'Certifications' },
        ]}
      />,
    )
    const bar = screen.getByRole('navigation', { name: 'Page sections' })
    expect(within(bar).getByRole('link', { name: 'Certifications' })).toHaveAttribute('href', '#certificates')
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
    localStorage.removeItem('theme')
  })
})

describe('Footer', () => {
  test('renders copyright and tagline', () => {
    render(<Footer />)
    expect(screen.getByText('Nemo is still building.')).toBeInTheDocument()
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
