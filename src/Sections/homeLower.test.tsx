import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import HomeCertifications from './HomeCertifications'
import Contact from './Contact'
import DepthGauge, { currentStop, gaugeStops } from '../Components/DepthGauge'
import { homeCertificates } from '../content/certifications'

describe('currentStop', () => {
  test('picks the last section whose top is above the viewport middle', () => {
    expect(currentStop([0, 800, 1600], 900)).toBe(1)
    expect(currentStop([0, 800, 1600], 100)).toBe(0)
    expect(currentStop([0, 800, 1600], 5000)).toBe(2)
    expect(currentStop([100, 800], 50)).toBe(0)
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
})
