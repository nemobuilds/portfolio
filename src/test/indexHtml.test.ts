import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { themeScript } from '../theme/themeScript'

const html = readFileSync(resolve(import.meta.dirname, '../../index.html'), 'utf8')
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1])
const bootScript = scripts.find(s => s.includes('boot-seen'))!

afterEach(() => {
  delete document.documentElement.dataset.boot
  sessionStorage.clear()
})

test('the inline theme script matches themeScript', () => {
  expect(scripts).toContain(themeScript)
})

test('first load in the tab marks data-boot before JS, so the boot colour paints at once', () => {
  new Function(bootScript)()
  expect(document.documentElement.dataset.boot).toBe('')
  expect(html).toMatch(/:root\[data-boot\],:root\[data-boot\] body\{background:#05080F!important\}/)
})

test('no data-boot when the boot was already seen', () => {
  sessionStorage.setItem('boot-seen', '1')
  new Function(bootScript)()
  expect(document.documentElement.dataset.boot).toBeUndefined()
})

test('SEO: description meta, no invented metrics', () => {
  expect(html).toContain(
    '<meta name="description" content="Portfolio of John Rogee Turqueza, a software engineer who builds web apps and backend systems." />',
  )
  expect(readFileSync(resolve(import.meta.dirname, '../../public/robots.txt'), 'utf8')).toMatch(/User-agent: \*\s+Allow: \//)
})
