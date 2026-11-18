import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from './ThemeProvider'
import ThemeToggle from '../Components/ThemeToggle'
import { themeScript } from './themeScript'

type Listener = (e: { matches: boolean }) => void
let listeners: Listener[] = []

function stubSystem(dark: boolean) {
  listeners = []
  window.matchMedia = ((query: string) => ({
    matches: dark,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_: string, l: Listener) => listeners.push(l),
    removeEventListener: (_: string, l: Listener) => {
      listeners = listeners.filter((x) => x !== l)
    },
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

function renderApp() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})
afterEach(() => {
  vi.restoreAllMocks()
})

test('no stored theme and dark system -> dark', () => {
  stubSystem(true)
  renderApp()
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument()
})

test('no stored theme and light system -> light', () => {
  stubSystem(false)
  renderApp()
  expect(document.documentElement.dataset.theme).toBe('light')
})

test('stored light beats dark system', () => {
  stubSystem(true)
  localStorage.setItem('theme', 'light')
  renderApp()
  expect(document.documentElement.dataset.theme).toBe('light')
})

test('toggle stores the choice', async () => {
  stubSystem(false)
  renderApp()
  await userEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
  expect(localStorage.getItem('theme')).toBe('dark')
  expect(document.documentElement.dataset.theme).toBe('dark')
})

test('system change applies when nothing is stored', () => {
  stubSystem(false)
  renderApp()
  act(() => listeners.forEach((l) => l({ matches: true })))
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(localStorage.getItem('theme')).toBeNull()
})

test('system change is ignored once a choice is stored', async () => {
  stubSystem(false)
  renderApp()
  await userEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
  act(() => listeners.forEach((l) => l({ matches: false })))
  expect(document.documentElement.dataset.theme).toBe('dark')
})

test('inline script sets the same initial theme', () => {
  stubSystem(true)
  new Function(themeScript)()
  expect(document.documentElement.dataset.theme).toBe('dark')
  localStorage.setItem('theme', 'light')
  new Function(themeScript)()
  expect(document.documentElement.dataset.theme).toBe('light')
})
