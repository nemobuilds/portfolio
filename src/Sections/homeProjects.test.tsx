import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect } from 'vitest'
import HomeProjects from './HomeProjects'
import { homeProjects } from '../content/projects'

const setup = () => render(<MemoryRouter><HomeProjects /></MemoryRouter>)
const stage = () => screen.getByRole('region', { name: 'Project preview' })

describe('HomeProjects', () => {
  test('first row is selected and shown in the stage', () => {
    setup()
    const group = screen.getByRole('group', { name: 'Projects' })
    const rows = within(group).getAllByRole('button')
    expect(rows).toHaveLength(homeProjects.length)
    expect(rows[0]).toHaveAttribute('aria-pressed', 'true')
    expect(rows[1]).toHaveAttribute('aria-pressed', 'false')
    expect(within(stage()).getByRole('heading', { name: homeProjects[0].name })).toBeInTheDocument()
    const all = screen.getByRole('link', { name: /All projects/ })
    expect(all).toHaveAttribute('href', '/projects')
    expect(all.className).toContain('border-[color-mix(') // outlined, like "All certifications"
  })

  test('Enter on the AMBITION row selects it and shows its stage', async () => {
    const user = userEvent.setup()
    setup()
    const row = screen.getByRole('button', { name: /AMBITION/ })
    row.focus()
    await user.keyboard('{Enter}')
    expect(row).toHaveAttribute('aria-pressed', 'true')
    expect(within(stage()).getByRole('heading', { name: 'AMBITION' })).toBeInTheDocument()
    expect(within(stage()).getByRole('link', { name: /Live demo/ })).toBeInTheDocument()
  })

  test('touch pointerenter changes nothing, mouse previews without selecting', () => {
    setup()
    const row = screen.getByRole('button', { name: /AMBITION/ })
    fireEvent.pointerEnter(row, { pointerType: 'touch' })
    expect(within(stage()).queryByRole('heading', { name: 'AMBITION' })).toBeNull()
    expect(row).toHaveAttribute('aria-pressed', 'false')
    fireEvent.pointerEnter(row, { pointerType: 'mouse' })
    expect(within(stage()).getByRole('heading', { name: 'AMBITION' })).toBeInTheDocument()
    expect(row).toHaveAttribute('aria-pressed', 'false')
  })

  test('only a small live region announces the selected project; hover is silent', async () => {
    const user = userEvent.setup()
    setup()
    expect(stage()).not.toHaveAttribute('aria-live')
    const live = document.querySelector('[aria-live="polite"]')!
    expect(live).toHaveClass('sr-only')
    expect(live).toHaveTextContent(homeProjects[0].name)
    const row = screen.getByRole('button', { name: /AMBITION/ })
    fireEvent.pointerEnter(row, { pointerType: 'mouse' })
    expect(live).toHaveTextContent(homeProjects[0].name)
    await user.click(row)
    expect(live).toHaveTextContent('AMBITION')
    expect(document.querySelectorAll('[aria-live]')).toHaveLength(1)
  })
})
