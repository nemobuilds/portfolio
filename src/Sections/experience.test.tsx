import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import Experience from './Experience'
import { experience } from '../content/experience'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-18'))
})
afterEach(() => vi.useRealTimers())

describe('Experience', () => {
  test('lead card reads "Next, API Engineer" with focus, org and period, description', () => {
    render(<Experience />)
    expect(screen.getByRole('heading', { level: 3, name: 'Next, API Engineer' })).toBeInTheDocument()
    expect(screen.getByText('Backend & site reliability · Azure')).toBeInTheDocument()
    expect(screen.getByText('East West Banking Corporation · from December 2026')).toBeInTheDocument()
    expect(screen.getByText(experience[0].description!)).toBeInTheDocument()
  })

  test('says "Now," once the start month has passed', () => {
    vi.setSystemTime(new Date('2027-01-05'))
    render(<Experience />)
    expect(screen.getByRole('heading', { level: 3, name: 'Now, API Engineer' })).toBeInTheDocument()
  })

  test('four compact rows follow, in data order, with no descriptions', () => {
    render(<Experience />)
    const rows = within(screen.getByRole('list', { name: 'Earlier roles' })).getAllByRole('listitem')
    expect(rows).toHaveLength(4)
    experience.slice(1).forEach((e, i) => {
      expect(within(rows[i]).getByText(e.period)).toBeInTheDocument()
      expect(within(rows[i]).getByText(e.role)).toBeInTheDocument()
      expect(within(rows[i]).getByText(e.org)).toBeInTheDocument()
    })
    expect(screen.getAllByText(experience[0].description!)).toHaveLength(1)
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
    expect(tiles.length).toBe(14)
    tiles.forEach((t) => expect(t.querySelector('img')).not.toBeNull())
  })
})
