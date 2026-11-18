import '@testing-library/jest-dom/vitest'

// matchMedia stub: matches=false by default. Override per test with
// window.matchMedia = vi.fn().mockImplementation(...) or Object.defineProperty.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList,
})
