import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
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

describe('useScrollDepth', () => {
  test('writes --depth on html after a scroll', () => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 1
    })
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
    const { result } = renderHook(() => useScrollDepth())
    expect(result.current).toBe(0)
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, configurable: true })
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current).toBe(0.5)
    expect(document.documentElement.style.getPropertyValue('--depth')).toBe('0.5000')
    vi.unstubAllGlobals()
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })
})
