import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

const css = readFileSync('src/index.css', 'utf8')

function block(selector: string): string {
  const start = css.indexOf(`${selector} {`)
  expect(start, `rule ${selector} exists`).toBeGreaterThan(-1)
  return css.slice(start, css.indexOf('}', start))
}

test('home pins its own text and focus tokens with higher specificity than data-theme', () => {
  const home = block(':root[data-surface="home"]')
  expect(home).toContain('--text: #17161C')
  expect(home).toContain('--focus-halo: #F4EEE3')
  // :root[attr] is (0,2,0); bare [data-theme="dark"] is (0,1,0)
  expect(css).toContain('[data-theme="dark"] {')
})

test('home body paints the water surface', () => {
  expect(css).toMatch(/:root\[data-surface="home"\] body\s*\{\s*background: var\(--water-surface\)/)
})

test('glass is not keyed on data-theme; deep modifier uses dark glass', () => {
  expect(css).not.toMatch(/\[data-theme="dark"\]\s+\.surface-glass/)
  expect(block('.surface-glass')).toContain('var(--glass-light)')
  expect(block('.surface-glass--deep')).toContain('var(--glass-dark)')
})
