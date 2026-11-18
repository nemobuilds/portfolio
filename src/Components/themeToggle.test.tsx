import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { ThemeProvider } from '../theme/ThemeProvider'
import ThemeToggle from './ThemeToggle'

const animate = vi.hoisted(() => vi.fn(() => Promise.reject(new Error('switch failed'))))
vi.mock('../theme/themeTransition', () => ({ animateThemeSwitch: animate }))

test('a failed switch raises no unhandled rejection and unlocks the toggle', async () => {
  const unhandled = vi.fn()
  process.on('unhandledRejection', unhandled)
  try {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(animate).toHaveBeenCalledTimes(1))
    await new Promise((r) => setTimeout(r, 20))
    fireEvent.click(screen.getByRole('button'))
    expect(animate).toHaveBeenCalledTimes(2)
    await new Promise((r) => setTimeout(r, 20))
    expect(unhandled).not.toHaveBeenCalled()
  } finally {
    process.off('unhandledRejection', unhandled)
  }
})

test('the toggle is transparent with the theme text colour, never pale glass (sun was invisible in dark)', () => {
  document.documentElement.dataset.theme = 'dark'
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
  const btn = screen.getByRole('button', { name: /Switch to/ })
  expect(btn.className).not.toContain('surface-glass')
  expect(btn.className).toContain('bg-transparent')
  expect(btn.className).toContain('text-[var(--text)]')
})
