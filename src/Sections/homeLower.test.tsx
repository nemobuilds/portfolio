import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import HomeCertifications from './HomeCertifications'
import Contact from './Contact'
import DepthGauge, { gaugeState, readingLine, gaugeStops } from '../Components/DepthGauge'
import { homeCertificates } from '../content/certifications'

describe('readingLine', () => {
  test('runs from the viewport top at the page top to the page end at the bottom', () => {
    expect(readingLine(0, 1400, 3000)).toBe(0)
    expect(readingLine(1600, 1400, 3000)).toBe(3000)
    expect(readingLine(800, 1400, 3000)).toBe(800 + 700)
  })
  test('a page that cannot scroll reads at its top', () => {
    expect(readingLine(0, 1400, 1000)).toBe(0)
  })
})

describe('gaugeState', () => {
  const tops = [0, 600, 1800, 2400, 2800]
  test('at the very top: Surface is current and the line is empty, even on a tall screen', () => {
    expect(gaugeState(tops, 0)).toEqual({ current: 0, fill: 0 })
  })
  test('the line fills exactly to the current stop when the reading line is on a section top', () => {
    expect(gaugeState(tops, 600)).toEqual({ current: 1, fill: 0.25 })
    expect(gaugeState(tops, 2800)).toEqual({ current: 4, fill: 1 })
  })
  test('between two stops the line sits part way, never past the next stop', () => {
    const s = gaugeState(tops, 1200)
    expect(s.current).toBe(1)
    expect(s.fill).toBeCloseTo(0.25 + 0.5 * 0.25)
  })
  test('the fill never runs ahead of the current stop or behind it', () => {
    for (let line = 0; line <= 3200; line += 50) {
      const { current, fill } = gaugeState(tops, line)
      expect(fill).toBeGreaterThanOrEqual(current / 4)
      expect(fill).toBeLessThan(current === 4 ? 1.0001 : (current + 1) / 4)
    }
  })
  test('missing sections are skipped', () => {
    expect(gaugeState([0, Infinity, 1800], 2000).current).toBe(2)
  })
})

describe('DepthGauge', () => {
  test('renders five real links with exact labels and depths', () => {
    render(<DepthGauge stops={gaugeStops} />)
    const nav = screen.getByRole('navigation', { name: 'Depth' })
    const links = within(nav).getAllByRole('link')
    expect(links).toHaveLength(5)
    const expected = [
      ['Surface', '0 m', '#top'],
      ['Projects', '12 m', '#projects'],
      ['Experience', '24 m', '#experience'],
      ['Certifications', '30 m', '#certificates'],
      ['Contact', '36 m', '#contact'],
    ]
    expected.forEach(([label, depth, href], i) => {
      expect(links[i]).toHaveTextContent(label)
      expect(links[i]).toHaveTextContent(depth)
      expect(links[i]).toHaveAttribute('href', href)
    })
  })

  test('exactly one link is current', () => {
    render(<DepthGauge stops={gaugeStops} />)
    expect(document.querySelectorAll('[aria-current="location"]')).toHaveLength(1)
  })

  test('stops above the current one are marked past (filled dots)', () => {
    const tops: Record<string, number> = { top: 0, projects: 600, experience: 1800, certificates: 2400, contact: 2800 }
    const els = Object.entries(tops).map(([id, t]) => {
      const el = document.createElement('section')
      el.id = id
      el.getBoundingClientRect = () => ({ top: t, bottom: t + 100, left: 0, right: 0, width: 0, height: 100, x: 0, y: t, toJSON() {} })
      document.body.appendChild(el)
      return el
    })
    Object.defineProperty(window, 'innerHeight', { value: 0, configurable: true })
    render(<DepthGauge stops={gaugeStops} />)
    const links = within(screen.getByRole('navigation', { name: 'Depth' })).getAllByRole('link')
    const current = links.findIndex((l) => l.getAttribute('aria-current') === 'location')
    links.forEach((l, i) => expect(l.hasAttribute('data-past')).toBe(i < current))
    els.forEach((e) => e.remove())
  })
})

describe('Contact', () => {
  test('email is the mailto link with the address as label', () => {
    render(<MemoryRouter><Contact /></MemoryRouter>)
    const mail = screen.getByRole('link', { name: 'jrogeet@gmail.com' })
    expect(mail).toHaveAttribute('href', 'mailto:jrogeet@gmail.com')
  })
  test('heading, resume download and external socials', () => {
    render(<MemoryRouter><Contact /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Say hello.')
    expect(document.querySelectorAll('h2 .accent-word')).toHaveLength(1)
    expect(screen.getByRole('link', { name: /Résumé \(PDF\)/ })).toHaveAttribute('download')
    for (const n of ['GitHub', 'LinkedIn', 'Instagram']) {
      const a = screen.getByRole('link', { name: new RegExp(n) })
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noreferrer')
    }
  })
})

describe('HomeCertifications', () => {
  test('three cards in homeOrder, linking to detail pages, plus the all link', () => {
    render(<MemoryRouter><HomeCertifications /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 2, name: 'Certifications' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /All certifications/ })).toHaveAttribute('href', '/certificates')
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(3)
    cards.forEach((c, i) => {
      const link = within(c).getByRole('link')
      expect(link).toHaveTextContent(homeCertificates[i].name)
      expect(link).toHaveAttribute('href', `/certificates/${homeCertificates[i].id}`)
    })
  })

  test('home cards are dark glass with a scan panel, "issuer · via", and no placeholder text', () => {
    render(<MemoryRouter><HomeCertifications /></MemoryRouter>)
    const cards = screen.getAllByRole('article')
    cards.forEach((c) => expect(c.className).toContain('surface-glass--deep'))
    expect(within(cards[0]).getByText('Microsoft · Pearson Vue')).toBeInTheDocument()
    expect(within(cards[0]).getByText('September 2026').className).toContain('text-[var(--ember)]')
    expect(screen.queryByText(/Screenshot here|\[Month YYYY\]/)).toBeNull()
  })
})

test('the depth gauge hides below 1280px, where it would cover the content', async () => {
  const { readFileSync } = await import('node:fs')
  const { resolve } = await import('node:path')
  const css = readFileSync(resolve(import.meta.dirname, '../index.css'), 'utf8')
  expect(css).toMatch(/@media \(max-width: 1279px\) \{ \.depth-gauge \{ display: none; \} \}/)
})
