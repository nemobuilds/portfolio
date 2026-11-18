import { afterEach, describe, expect, test, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { animateThemeSwitch, coverRadius, revealRadius } from './themeTransition'
import ThemeToggle from '../Components/ThemeToggle'
import { ThemeProvider } from './ThemeProvider'

const doc = document as Document & { startViewTransition?: unknown }

function setReduce(reduce: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: reduce,
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
}

afterEach(() => {
  delete doc.startViewTransition
  vi.restoreAllMocks()
})

describe('animateThemeSwitch', () => {
  test('reduced motion applies at once', async () => {
    setReduce(true)
    const start = vi.fn()
    doc.startViewTransition = start
    const apply = vi.fn()
    await animateThemeSwitch({ x: 1, y: 1 }, apply)
    expect(apply).toHaveBeenCalledTimes(1)
    expect(start).not.toHaveBeenCalled()
  })

  test('no View Transitions support applies at once', async () => {
    setReduce(false)
    const apply = vi.fn()
    await animateThemeSwitch({ x: 1, y: 1 }, apply)
    expect(apply).toHaveBeenCalledTimes(1)
  })
})

describe('animateThemeSwitch when startViewTransition throws', () => {
  test('applies the theme once and leaves no canvas behind', async () => {
    setReduce(false)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    doc.startViewTransition = () => {
      throw new Error('InvalidStateError')
    }
    const apply = vi.fn()
    await expect(animateThemeSwitch({ x: 1, y: 1 }, apply)).resolves.toBeUndefined()
    expect(apply).toHaveBeenCalledTimes(1)
    expect(document.querySelector('body > canvas')).toBeNull()
  })
})

describe('radii', () => {
  test('coverRadius reaches the farthest corner', () => {
    expect(coverRadius({ x: 0, y: 0 }, 300, 400)).toBe(500 + 4 * 18)
  })
  test('revealRadius starts at 0 and passes the cover radius at the end', () => {
    expect(revealRadius(0, 500)).toBe(0)
    expect(revealRadius(1, 500)).toBe(500 + 9 * 18)
  })
})

describe('ThemeToggle', () => {
  test('a second click during a switch is ignored', () => {
    setReduce(false)
    doc.startViewTransition = (cb: () => void) => {
      cb()
      return { ready: new Promise(() => {}), finished: new Promise(() => {}) }
    }
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    const btn = screen.getByRole('button')
    const before = btn.getAttribute('aria-label')
    fireEvent.click(btn)
    const after = btn.getAttribute('aria-label')
    expect(after).not.toBe(before)
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-label')).toBe(after)
  })
})
