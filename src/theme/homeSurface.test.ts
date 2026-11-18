import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'

const css = readFileSync(resolve(import.meta.dirname, '../index.css'), 'utf8')

function block(selector: string): string {
  const start = css.indexOf(`${selector} {`)
  expect(start, `rule ${selector} exists`).toBeGreaterThan(-1)
  return css.slice(start, css.indexOf('}', start))
}

function props(body: string): string[] {
  return [...body.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1])
}

test('home pins every token the dark block sets, so no theme token leaks', () => {
  const dark = props(block('[data-theme="dark"]'))
  const home = props(block(':root[data-surface="home"]'))
  expect(dark.length).toBeGreaterThan(0)
  expect(home).toEqual(expect.arrayContaining(dark))
})

test('home pins ink text and cream halo', () => {
  const home = block(':root[data-surface="home"]')
  expect(home).toContain('--text: #17161C')
  expect(home).toContain('--focus-halo: #F4EEE3')
  expect(home).toContain('--card-fill: linear-gradient(#EBEFF5, #DDE3EC)')
})

test('home body paints the water surface', () => {
  expect(css).toMatch(/:root\[data-surface="home"\] body\s*\{\s*background: var\(--water-surface\)/)
})

test('glass is not keyed on data-theme; deep modifier uses dark glass', () => {
  expect(css).not.toMatch(/\[data-theme="dark"\]\s+\.surface-glass/)
  expect(block('.surface-glass')).toContain('var(--glass-light)')
  expect(block('.surface-glass--deep')).toContain('var(--glass-dark)')
})
