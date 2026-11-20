import { expect, test } from 'vitest'
import { validateProjects } from './validate'

const ok = (fm: string, body = '') => `---\n${fm}\n---\n${body}`
const base = 'name: A\nsummary: S\ncategories: [Full-Stack Applications]\norder: 1\nstack: [React]'
const yes = () => true

test('slug comes from the file name', () => {
  expect(validateProjects({ '/x/my-app.md': ok(base) }, yes)[0].slug).toBe('my-app')
})
test('missing summary names file and field', () => {
  expect(() => validateProjects({ '/x/a.md': ok('name: A\ncategories: [Full-Stack Applications]\norder: 1\nstack: [React]') }, yes))
    .toThrow(/a\.md.*summary/)
})
test('duplicate homeOrder fails', () => {
  const fm = (o: number) => `name: A\nsummary: S\ncategories: [Full-Stack Applications]\norder: ${o}\nstack: [React]\nhome: true\nhomeOrder: 1`
  expect(() => validateProjects({ '/x/a.md': ok(fm(1)), '/x/b.md': ok(fm(2)) }, yes)).toThrow(/homeOrder/)
})
test('six home projects fail', () => {
  const files: Record<string, string> = {}
  for (let i = 1; i <= 6; i++) {
    files[`/x/p${i}.md`] = ok(`name: A\nsummary: S\ncategories: [Full-Stack Applications]\norder: ${i}\nstack: [React]\nhome: true\nhomeOrder: ${i}`)
  }
  expect(() => validateProjects(files, yes)).toThrow(/at most 5/)
})
test('home without homeOrder fails', () => {
  expect(() => validateProjects({ '/x/a.md': ok(base + '\nhome: true') }, yes)).toThrow(/a\.md.*homeOrder/)
})
test('duplicate order fails', () => {
  expect(() => validateProjects({ '/x/a.md': ok(base), '/x/b.md': ok(base) }, yes)).toThrow(/order/)
})
test('invalid slug fails', () => {
  expect(() => validateProjects({ '/x/Bad_Name.md': ok(base) }, yes)).toThrow(/Bad_Name\.md.*slug/)
})
test('non-https url fails', () => {
  expect(() => validateProjects({ '/x/a.md': ok(base + '\nrepoUrl: http://x.com') }, yes)).toThrow(/a\.md.*repoUrl/)
})
test('private maps to isPrivate', () => {
  expect(validateProjects({ '/x/a.md': ok(base + '\nprivate: true') }, yes)[0].isPrivate).toBe(true)
  expect(validateProjects({ '/x/a.md': ok(base) }, yes)[0].isPrivate).toBe(false)
})
test('missing image file fails', () => {
  expect(() => validateProjects({ '/x/a.md': ok(base + '\nthumbnail: /images/projects/a/t.png') }, () => false))
    .toThrow(/a\.md.*thumbnail/)
})
test('image outside the slug folder fails', () => {
  expect(() => validateProjects({ '/x/a.md': ok(base + '\nthumbnail: /images/other.png') }, yes))
    .toThrow(/a\.md.*thumbnail/)
})
test('valid image path passes', () => {
  const [p] = validateProjects({ '/x/a.md': ok(base + '\nthumbnail: /images/projects/a/t.png') }, yes)
  expect(p.thumbnail).toBe('/images/projects/a/t.png')
})
test('unknown body heading fails', () => {
  expect(() => validateProjects({ '/x/a.md': ok(base, '## Problem\np\n## Approach\na\n## What I built\nb\n## Extra\nx') }, yes))
    .toThrow(/a\.md.*Extra/)
})
test('missing required section fails', () => {
  expect(() => validateProjects({ '/x/a.md': ok(base, '## Problem\np\n## Approach\na') }, yes))
    .toThrow(/a\.md.*What I built/)
})
test('body becomes caseStudy HTML', () => {
  const [p] = validateProjects({ '/x/a.md': ok(base, '## Problem\n**p**\n## Approach\na\n## What I built\n- b') }, yes)
  expect(p.caseStudy?.problem).toContain('<strong>p</strong>')
  expect(p.caseStudy?.built).toContain('<li>b</li>')
  expect(p.caseStudy?.results).toBeUndefined()
})
test('categories is a list of known names', () => {
  const fm = (cats: string) => `name: A\nsummary: S\ncategories: ${cats}\norder: 1\nstack: [React]`
  expect(validateProjects({ '/x/a.md': ok(fm('[Backend & APIs, Open Source]')) }, yes)[0].categories).toEqual([
    'Backend & APIs',
    'Open Source',
  ])
  expect(() => validateProjects({ '/x/a.md': ok(fm('[Nope]')) }, yes)).toThrow(/a\.md.*categories/)
  expect(() => validateProjects({ '/x/a.md': ok(fm('[]')) }, yes)).toThrow(/a\.md.*categories/)
  expect(() => validateProjects({ '/x/a.md': ok(fm('[Academic, Academic]')) }, yes)).toThrow(/a\.md.*twice/)
})
test('the old single category field names the new field', () => {
  const old = 'name: A\nsummary: S\ncategory: Backend & APIs\norder: 1\nstack: [React]'
  expect(() => validateProjects({ '/x/a.md': ok(old) }, yes)).toThrow(/a\.md.*"category" was replaced by "categories"/)
})
test('no body means no caseStudy', () => {
  expect(validateProjects({ '/x/a.md': ok(base) }, yes)[0].caseStudy).toBeUndefined()
})
