import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect } from 'vitest'
import Hero from './Hero'
import { waterColor, waterGradient } from './Water'
import HomePage from '../Pages/HomePage'
import { ThemeProvider } from '../theme/ThemeProvider'

describe('waterColor', () => {
  test('ends and stops', () => {
    expect(waterColor(0)).toBe('#e9f0f9')
    expect(waterColor(0.25)).toBe('#93b1e6')
    expect(waterColor(0.5)).toBe('#3557c2')
    expect(waterColor(0.75)).toBe('#0a0e28')
    expect(waterColor(1)).toBe('#05080f')
  })
  test('clamps and mixes', () => {
    expect(waterColor(2)).toBe('#05080f')
    expect(waterColor(0.125)).not.toBe('#e9f0f9')
  })
})

describe('waterGradient', () => {
  const layout = { projects: { top: 700, height: 900 }, experience: 1600, certificates: 2700, contact: 3300 }
  const stops = (css: string) => [...css.matchAll(/(#[0-9a-f]{6}) (\d+)px/g)].map((m) => [m[1], Number(m[2])] as const)

  test('pins the water to the sections, top to bottom', () => {
    const s = stops(waterGradient(layout))
    expect(s[0]).toEqual(['#e9f0f9', 0])
    expect(s).toContainEqual(['#e9f0f9', 700]) // surface through the hero, to the projects top
    expect(s).toContainEqual(['#3557c2', 1600]) // reef where Experience starts, so its pale text reads
    expect(s).toContainEqual(['#0a0e28', 2700]) // deep at Certifications
    expect(s).toContainEqual(['#05080f', 3300]) // abyss at Contact
    expect(waterGradient(layout).endsWith('#05080f 100%)')).toBe(true) // ends with the page, never past it
  })

  test('stops never go backwards, whatever the screen height', () => {
    const s = stops(waterGradient({ ...layout, projects: { top: 700, height: 60 }, experience: 720 }))
    for (let i = 1; i < s.length; i++) expect(s[i][1]).toBeGreaterThanOrEqual(s[i - 1][1])
  })
})

describe('Hero', () => {
  test('the first sentence is the big heading; the greeting is a small opener above it', () => {
    render(<MemoryRouter><Hero /></MemoryRouter>)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.textContent!.replace(/\s+/g, ' ').trim()).toBe(
      'Software Engineer from Manila. I build full-stack applications with intention, creativity, and love for the craft.',
    )
    expect(h1.className).toContain('text-[clamp(26px,3vw,36px)]')
    const opener = screen.getByText('Hi, I’m John Rogee').closest('p')!
    expect(opener).toHaveTextContent('aka Nemo')
    expect(opener.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByText(/push it until it bends/)).toBeNull()
  })

  test('lines up with the other home sections: side padding inside the 1200px container', () => {
    const { container } = render(<MemoryRouter><Hero /></MemoryRouter>)
    const section = container.querySelector('#top')!
    expect(section.className).not.toMatch(/(^|\s)px-/)
    const inner = section.firstElementChild!
    for (const cls of ['max-w-[1200px]', 'mx-auto', 'px-4', 'min-[760px]:px-8']) expect(inner.className).toContain(cls)
  })

  test('left-aligned two-column grid with an empty right slot for later content', () => {
    const { container } = render(<MemoryRouter><Hero /></MemoryRouter>)
    const slot = container.querySelector('[data-slot="hero-right"]')!
    expect(slot).toBeEmptyDOMElement()
    expect(slot).toHaveAttribute('aria-hidden', 'true')
    expect(slot.parentElement!.className).toContain('min-[900px]:grid-cols-')
    expect(container.querySelector('#top')!.className).not.toContain('text-center')
  })

  test('the Endpoint sentence is small and muted, with Endpoint linked to its project page', () => {
    render(<MemoryRouter><Hero /></MemoryRouter>)
    const link = screen.getByRole('link', { name: 'Endpoint' })
    expect(link.closest('p')!.className).toContain('text-[15px]')
    expect(link.closest('p')!.className).toContain('text-[var(--text-secondary)]')
    expect(link).toHaveAttribute('href', '/projects/endpoint')
    expect(link.closest('p')).toHaveTextContent(
      'Lately I’ve been building Endpoint, an API health monitor that runs scheduled uptime and response-time checks.',
    )
  })

  test('top padding clears the floating pill (16px offset + ~54px tall)', () => {
    const { container } = render(<MemoryRouter><Hero /></MemoryRouter>)
    const cls = container.querySelector('#top')!.className
    const pads = [...cls.matchAll(/pt-\[(\d+)px\]/g)].map((m) => Number(m[1]))
    expect(pads.length).toBeGreaterThan(0)
    for (const px of pads) expect(px).toBeGreaterThanOrEqual(88)
  })

  test('both buttons link to the sections', () => {
    render(<MemoryRouter><Hero /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /See the work/ })).toHaveAttribute('href', '#projects')
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '#contact')
  })
})

describe('HomePage', () => {
  test('renders anchored sections and the water layer', () => {
    const { container } = render(
      <ThemeProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </ThemeProvider>,
    )
    for (const id of ['top', 'projects', 'experience', 'certificates', 'contact']) {
      expect(container.querySelector(`#${id}`)).not.toBeNull()
    }
    // the water runs the length of the page (absolute), not one fixed screen colour
    const water = screen.getByTestId('water')
    expect(water).toHaveClass('absolute', '-z-10')
    expect(water).not.toHaveClass('fixed')
    expect(water.style.background).toContain('linear-gradient')
    expect(water).toHaveClass('top-0', 'bottom-0') // spans the page wrapper, no measured height
    expect(water.style.height).toBe('')
    expect(water.closest('div.relative')).not.toBeNull() // the Layout wrapper is the positioned box
    expect(document.documentElement.dataset.surface).toBe('home')
  })

  test('sets the document title back to the name (subpages change it)', () => {
    document.title = 'Tachyon · John Rogee Turqueza'
    render(
      <ThemeProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </ThemeProvider>,
    )
    expect(document.title).toBe('John Rogee Turqueza')
  })
})
