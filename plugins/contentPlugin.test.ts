import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { contentPlugin, loadProjects } from './contentPlugin'

const root = resolve(import.meta.dirname, '..')
let dir: string | undefined
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true })
  dir = undefined
})

function fixture(name: string, raw: string): string {
  dir = mkdtempSync(join(tmpdir(), 'content-'))
  writeFileSync(join(dir, name), raw)
  return dir
}

const fm = 'name: D\nsummary: S\ncategory: Full-Stack Applications\norder: 1\nstack: [React]'

type Hooks = {
  resolveId: (id: string) => string | undefined
  load: (this: { error(m: string): never }, id: string) => string | undefined
}
const ctx = {
  error: (m: string): never => {
    throw new Error(`plugin error: ${m}`)
  },
}
const loadVirtual = (plugin: Hooks) => plugin.load.call(ctx, plugin.resolveId('virtual:content/projects')!)
const parse = (code: string) => JSON.parse(code.slice('export default '.length))

test('a missing image file fails and names the file and field', () => {
  const d = fixture('demo.md', `---\n${fm}\nthumbnail: /images/projects/demo/nope.webp\n---\n`)
  expect(() => loadProjects(root, d)).toThrow(/demo\.md: thumbnail file not found in public\//)
})

test('the virtual module is plain JSON with rendered case-study HTML', () => {
  const d = fixture('demo.md', `---\n${fm}\n---\n## Problem\n**p**\n## Approach\na\n## What I built\nb\n`)
  const code = loadVirtual(contentPlugin({ dir: d }) as unknown as Hooks)!
  expect(code.startsWith('export default [')).toBe(true)
  const [p] = parse(code)
  expect(p.slug).toBe('demo')
  expect(p.caseStudy.problem).toContain('<strong>p</strong>')
})

test('the real content loads through the plugin', () => {
  const code = loadVirtual(contentPlugin() as unknown as Hooks)!
  expect(parse(code)).toEqual(JSON.parse(JSON.stringify(loadProjects(root))))
})

test('bad content becomes a plugin error that names the file, so vite build fails', () => {
  const d = fixture('Bad_Name.md', `---\n${fm}\n---\n`)
  expect(() => loadVirtual(contentPlugin({ dir: d }) as unknown as Hooks)).toThrow(/plugin error: .*Bad_Name\.md.*slug/)
})

test('other ids are not handled', () => {
  const plugin = contentPlugin() as unknown as Hooks
  expect(plugin.resolveId('virtual:other')).toBeUndefined()
  expect(plugin.load.call(ctx, 'src/x.ts')).toBeUndefined()
})
