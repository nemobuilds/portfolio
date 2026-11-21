import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import Experience from './Experience'
import { experience } from '../content/experience'
import { tools } from '../content/tools'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-18'))
})
afterEach(() => vi.useRealTimers())

// The API Engineer entry is hidden on the site; these lead-card tests show it again by dropping the flag.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unhidden = experience.map(({ hidden, ...e }) => e)

describe('Experience', () => {
  test('a hidden entry stays in the data but is not shown: no future role or date', () => {
    expect(experience[0]).toMatchObject({ role: 'API Engineer', hidden: true })
    render(<Experience />)
    expect(screen.queryByText(/API Engineer/)).toBeNull()
    expect(screen.queryByText(/December 2026/)).toBeNull()
    expect(screen.queryByText('Next,')).toBeNull()
  })

  test('the current role (current: true) gets a light slate "Now," card with the decorative ring', () => {
    expect(experience.find((e) => e.current)).toMatchObject({ role: 'Software Test Engineer' })
    render(<Experience />)
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(1)
    const card = cards[0]
    expect(card.className).toContain('surface-slate')
    expect(within(card).getByRole('heading', { level: 3, name: 'Now, Software Test Engineer' })).toBeInTheDocument()
    expect(within(card).getByText('East West Banking Corporation · 2025 – now')).toBeInTheDocument()
    expect(within(card).getByText('Now,').className).toContain('text-[var(--date)]')
    expect(card.querySelector('span[aria-hidden="true"].rounded-full')).not.toBeNull()
  })

  test('only past roles stay in the dark list', () => {
    render(<Experience />)
    const rows = within(screen.getByRole('list', { name: 'Earlier roles' })).getAllByRole('listitem')
    expect(rows.map((r) => r.querySelector('b')?.textContent)).toEqual([
      'Software QA Tester',
      '4th-Year Representative',
      'BS Computer Science',
    ])
  })

  test('the current flag is data, not the word "now" in the period', () => {
    render(<Experience entries={[{ period: '2024 – now', role: 'Volunteer', org: 'Org' }]} />)
    expect(screen.queryByRole('article')).toBeNull()
    expect(within(screen.getByRole('list', { name: 'Earlier roles' })).getByText('Volunteer')).toBeInTheDocument()
  })

  test('lead card reads "Next, API Engineer" with focus, org and period, description', () => {
    render(<Experience entries={unhidden} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Next, API Engineer' })).toBeInTheDocument()
    expect(screen.getByText('Backend & site reliability · Azure')).toBeInTheDocument()
    expect(screen.getByText('East West Banking Corporation · from December 2026')).toBeInTheDocument()
    expect(screen.getByText(experience[0].description!)).toBeInTheDocument()
  })

  test('"Next," is the accent orange (large text) and the focus line is bold ember (AA on dark glass)', () => {
    render(<Experience entries={unhidden} />)
    expect(screen.getByText('Next,').className).toContain('text-[var(--accent)]')
    const focus = screen.getByText('Backend & site reliability · Azure')
    expect(focus.className).toContain('text-[var(--ember)]')
    expect(focus.className).toContain('font-bold')
    const css = readFileSync(resolve(import.meta.dirname, '../index.css'), 'utf8')
    expect(css).toMatch(/--ember: #FF9A52;/)
  })

  test('says "Now," once the start month has passed', () => {
    vi.setSystemTime(new Date('2027-01-05'))
    render(<Experience entries={unhidden} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Now, API Engineer' })).toBeInTheDocument()
  })

  test('past roles follow as compact rows, in data order, with no descriptions', () => {
    render(<Experience entries={unhidden} />)
    const rows = within(screen.getByRole('list', { name: 'Earlier roles' })).getAllByRole('listitem')
    expect(rows).toHaveLength(3)
    experience.filter((e) => !e.start && !e.current).forEach((e, i) => {
      expect(within(rows[i]).getByText(e.period)).toBeInTheDocument()
      expect(within(rows[i]).getByText(e.role)).toBeInTheDocument()
      expect(within(rows[i]).getByText(e.org)).toBeInTheDocument()
    })
    expect(screen.getAllByText(experience[0].description!)).toHaveLength(1)
  })

  test('headings are cream at every width (ink fails on reef water)', () => {
    render(<Experience />)
    for (const name of ['Experience', 'Tech stack']) {
      const h = screen.getByRole('heading', { level: 2, name })
      expect(h.className).toContain('text-[var(--cream)]')
      expect(h.className).not.toContain('ink')
      expect(h.getAttribute('style') ?? '').not.toContain('ink')
    }
  })

  test('earlier roles sit on dark glass at every width, with ember dates', () => {
    render(<Experience />)
    const list = screen.getByRole('list', { name: 'Earlier roles' })
    expect(list.className).toContain('bg-[var(--glass-dark)]')
    expect(list.className).not.toContain('max-[899px]:')
    expect(within(list).getByText(experience[2].period).className).toContain('text-[var(--ember)]')
  })

  test('two separate headings, no combined heading', () => {
    render(<Experience />)
    expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Tech stack' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /experience.*tech/i })).toBeNull()
  })

  test('Postman sits in "QA & performance" with a decorative logo', () => {
    render(<Experience />)
    const group = screen.getByRole('region', { name: 'QA & performance' })
    const postman = within(group).getByText('Postman')
    const img = postman.closest('li')!.querySelector('img')!
    expect(img).toHaveAttribute('alt', '')
  })

  test('every tile shows a logo with its name', () => {
    render(<Experience />)
    const tiles = document.querySelectorAll('.app-cell')
    // Every tool in tools.ts shows: the content check requires a logo for each one.
    expect(tiles.length).toBe(tools.reduce((n, g) => n + g.items.length, 0))
    tiles.forEach((t) => expect(t.querySelector('img')).not.toBeNull())
  })
})
