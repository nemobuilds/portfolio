import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import App from '../App'
import { BootScreen } from './BootScreen'
import { shouldBoot, trackProgress } from './bootProgress'

const renderer = vi.hoisted(() => ({
  setProgress: vi.fn(),
  play: vi.fn(),
  skip: vi.fn(),
  destroy: vi.fn(),
}))
vi.mock('./bootRenderer', () => ({ createBootRenderer: () => renderer }))
// jsdom loads no fonts or images, so the real tasks would only end at the 4 s cap.
vi.mock('./bootProgress', async importOriginal => ({
  ...(await importOriginal<typeof import('./bootProgress')>()),
  bootTasks: () => [Promise.resolve()],
}))

const LABEL = 'Loading John Rogee Turqueza’s portfolio'

beforeEach(() => sessionStorage.clear())
afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
  sessionStorage.clear()
})

describe('boot progress', () => {
  test('progress reports each settled task and ends at 1', async () => {
    const seen: number[] = []
    await trackProgress([Promise.resolve(1), Promise.resolve(2)], f => seen.push(f), 4000)
    expect(seen).toEqual([0.5, 1])
  })

  test('a rejected task still counts as settled', async () => {
    const seen: number[] = []
    await trackProgress([Promise.reject(new Error('x')), Promise.resolve(2)], f => seen.push(f), 4000)
    expect(seen).toEqual([0.5, 1])
  })

  test('progress is capped at 4 s', async () => {
    vi.useFakeTimers()
    const seen: number[] = []
    let done = false
    trackProgress([new Promise(() => {})], f => seen.push(f), 4000).then(() => (done = true))
    await vi.advanceTimersByTimeAsync(3999)
    expect(done).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(seen).toEqual([1])
    expect(done).toBe(true)
  })

  test('shouldBoot is false after the first boot', () => {
    expect(shouldBoot({ getItem: () => '1' })).toBe(false)
    expect(shouldBoot({ getItem: () => null })).toBe(true)
  })
})

describe('BootScreen', () => {
  test('BootScreen has the status role and label', () => {
    render(<BootScreen onDone={() => {}} />)
    expect(screen.getByRole('status', { name: LABEL })).toBeInTheDocument()
  })

  test('a key press skips to the end and calls onDone', async () => {
    const onDone = vi.fn()
    render(<BootScreen onDone={onDone} />)
    await userEvent.keyboard('a')
    expect(renderer.skip).toHaveBeenCalled()
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem('boot-seen')).toBe('1')
  })

  test('the app is inert while booting and focus stays at the document start after', async () => {
    document.documentElement.dataset.boot = ''
    render(
      <MemoryRouter initialEntries={['/nowhere']}>
        <App />
      </MemoryRouter>,
    )
    const heading = await screen.findByRole('heading', { level: 1, name: 'Page not found' })
    expect(heading.closest('[inert]')).not.toBeNull()
    expect(document.documentElement.dataset.boot).toBe('')
    expect(screen.getByRole('status', { name: LABEL })).toBeInTheDocument()

    await waitFor(() => expect(renderer.play).toHaveBeenCalled())
    act(() => renderer.play.mock.calls[0][0]())

    expect(screen.queryByRole('status', { name: LABEL })).not.toBeInTheDocument()
    expect(heading.closest('[inert]')).toBeNull()
    expect(document.documentElement.dataset.boot).toBeUndefined()
    expect(document.activeElement).toBe(document.body)
    await userEvent.tab()
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus()
    expect(sessionStorage.getItem('boot-seen')).toBe('1')
  })

  test('a pointer skip does not click through to the link underneath', () => {
    vi.useFakeTimers()
    const onDone = vi.fn()
    const onClick = vi.fn()
    render(
      <>
        <a href="#work" onClick={onClick}>
          See the work
        </a>
        <BootScreen onDone={onDone} />
      </>,
    )
    const link = screen.getByRole('link', { name: 'See the work' })
    act(() => {
      window.dispatchEvent(new Event('pointerdown'))
    })
    expect(onDone).toHaveBeenCalledTimes(1)
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(click)
    expect(onClick).not.toHaveBeenCalled()
    expect(click.defaultPrevented).toBe(true)
    act(() => {
      vi.advanceTimersByTime(600)
    })
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('no boot when it was already seen this session', async () => {
    sessionStorage.setItem('boot-seen', '1')
    document.documentElement.dataset.boot = ''
    render(
      <MemoryRouter initialEntries={['/nowhere']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('status', { name: LABEL })).not.toBeInTheDocument()
    expect((await screen.findByRole('heading', { level: 1, name: 'Page not found' })).closest('[inert]')).toBeNull()
    expect(document.documentElement.dataset.boot).toBeUndefined()
  })
})
