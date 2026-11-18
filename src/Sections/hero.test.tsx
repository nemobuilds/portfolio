import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect } from 'vitest'
import Hero from './Hero'
import { waterColor } from './Water'
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

describe('Hero', () => {
  test('h1 text and single accent word', () => {
    render(<MemoryRouter><Hero /></MemoryRouter>)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('I build software with care, push it until it bends, and make it stronger.')
    const accents = h1.querySelectorAll('.accent-word')
    expect(accents).toHaveLength(1)
    expect(accents[0]).toHaveTextContent('stronger')
    expect(screen.getByText('aka Nemo')).toBeInTheDocument()
    expect(screen.getByText('Building software, and learning how to keep it fast and up.')).toBeInTheDocument()
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
    expect(screen.getByTestId('water')).toBeInTheDocument()
    expect(document.documentElement.dataset.surface).toBe('home')
  })
})
