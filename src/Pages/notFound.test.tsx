import { render, screen } from '@testing-library/react'
import { MemoryRouter, Link, Route, Routes } from 'react-router-dom'
import { describe, test, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { ThemeProvider } from '../theme/ThemeProvider'
import NotFoundPage from './NotFoundPage'

const theme = () => document.documentElement.dataset.theme

describe('NotFoundPage', () => {
  test('* route renders Page not found with both actions', () => {
    render(
      <MemoryRouter initialEntries={['/nowhere']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the surface' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /See the projects/ })).toHaveAttribute('href', '/projects')
    expect(document.title).toBe('Page not found · John Rogee Turqueza')
  })

  test('project variant copy and links', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <NotFoundPage variant="project" />
        </MemoryRouter>
      </ThemeProvider>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Project not found' })).toBeInTheDocument()
    expect(screen.getByText('This project was renamed or removed.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /All projects/ })).toHaveAttribute('href', '/projects')
    expect(document.title).toBe('Project not found · John Rogee Turqueza')
  })

  test('is dark while mounted even when light is stored, then restores, with no theme toggle', async () => {
    localStorage.setItem('theme', 'light')
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/gone']}>
          <Link to="/">leave</Link>
          <Routes>
            <Route path="/" element={<p>home</p>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )
    expect(theme()).toBe('dark')
    expect(screen.queryByRole('button', { name: /Switch to/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('leave'))
    expect(theme()).toBe('light')
  })
})
