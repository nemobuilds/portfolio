import { renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, test, expect, vi } from 'vitest'
import { depthAt, useScrollDepth } from './useScrollDepth'

describe('depthAt', () => {
  test('clamps to 0-1', () => {
    expect(depthAt(0, 1000)).toBe(0)
    expect(depthAt(500, 1000)).toBe(0.5)
    expect(depthAt(2000, 1000)).toBe(1)
    expect(depthAt(-50, 1000)).toBe(0)
  })
  test('returns 0 when the page cannot scroll', () => {
    expect(depthAt(100, 0)).toBe(0)
  })
})

const setScroll = (y: number) => Object.defineProperty(window, 'scrollY', { value: y, configurable: true })

describe('useScrollDepth', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 1
    })
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    setScroll(0)
  })

  test('follows the scroll and writes no --depth on html', () => {
    const { result } = renderHook(() => useScrollDepth())
    expect(result.current).toBe(0)
    act(() => {
      setScroll(500)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current).toBe(0.5)
    expect(document.documentElement.style.getPropertyValue('--depth')).toBe('')
  })

  test('every caller shares the same depth', () => {
    const a = renderHook(() => useScrollDepth())
    const b = renderHook(() => useScrollDepth())
    act(() => {
      setScroll(250)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(a.result.current).toBe(0.25)
    expect(b.result.current).toBe(0.25)
  })

  test('a remount after the last unsubscribe starts from the live scroll, not the old depth', () => {
    const first = renderHook(() => useScrollDepth())
    act(() => {
      setScroll(1000)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(first.result.current).toBe(1)
    first.unmount()
    setScroll(0)
    const seen: number[] = []
    renderHook(() => {
      const d = useScrollDepth()
      seen.push(d)
      return d
    })
    expect(seen[0]).toBe(0)
  })
})
