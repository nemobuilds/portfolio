import { act, render } from '@testing-library/react'
import { MemoryRouter, useNavigate, type NavigateFunction } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ScrollToTop } from './ScrollToTop'

let navigate: NavigateFunction
function Grab() {
  navigate = useNavigate()
  return null
}

function start(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <ScrollToTop />
      <Grab />
    </MemoryRouter>,
  )
}

const go = (to: string | number) =>
  act(() => {
    if (typeof to === 'number') navigate(to)
    else navigate(to)
  })

let scrollTo: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  scrollTo.mockRestore()
})

describe('ScrollToTop', () => {
  test('does not scroll on the first render', () => {
    start('/projects')
    expect(scrollTo).not.toHaveBeenCalled()
  })

  test('a PUSH to a new pathname scrolls to the top', async () => {
    start('/')
    await go('/projects')
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  test('a REPLACE to a new pathname scrolls to the top', async () => {
    start('/projects')
    await act(() => navigate('/projects/tachyon', { replace: true }))
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  test('a POP (back / forward) keeps the browser scroll position', async () => {
    start('/')
    await go('/projects')
    scrollTo.mockClear()
    await go(-1)
    expect(scrollTo).not.toHaveBeenCalled()
  })

  test('a link with a hash leaves scrolling to the hash handler', async () => {
    start('/projects')
    await go('/#experience')
    expect(scrollTo).not.toHaveBeenCalled()
  })

  test('opening and closing a certificate dialog keeps the list scroll', async () => {
    start('/certificates')
    await go('/certificates/pcap')
    await go('/certificates')
    await go('/certificates/ccst-cybersecurity')
    expect(scrollTo).not.toHaveBeenCalled()
  })

  test('leaving the certificates page still scrolls to the top', async () => {
    start('/certificates/pcap')
    await go('/projects')
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  test('the same pathname with a new search does not scroll', async () => {
    start('/projects')
    await go('/projects?x=1')
    expect(scrollTo).not.toHaveBeenCalled()
  })
})
