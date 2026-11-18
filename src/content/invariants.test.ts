// The build's content check (npm run check:content). Only rules that every valid
// edit keeps: no test here may pin today's projects, certifications or their order.
import { copyFileSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import { loadProjects, PROJECTS_DIR } from '../../plugins/contentPlugin'
import { certificates, type Certificate } from './certifications'
import { projects } from './projects'
import { techLogo } from './techLogos'
import { tools } from './tools'
import type { Project } from './types'

const root = resolve(import.meta.dirname, '../..')
const inPublic = (p: string) => existsSync(join(root, 'public', p))

function projectProblems(list: Project[]): string[] {
  const problems: string[] = []
  if (list.length === 0) problems.push('no projects')
  for (const p of list) {
    for (const s of p.stack) {
      if (!['logo', 'chain', 'code'].includes(techLogo(s).kind)) problems.push(`${p.slug}: stack item ${s}`)
    }
  }
  return problems
}

function certificateProblems(list: Certificate[], exists: (p: string) => boolean): string[] {
  const problems: string[] = []
  const ids = list.map(c => c.id)
  ids.forEach((id, i) => ids.indexOf(id) !== i && problems.push(`id ${id} is used twice`))
  for (const c of list) {
    if (!/^[a-z0-9-]+$/.test(c.id)) problems.push(`${c.id}: id must match ^[a-z0-9-]+$`)
    if (c.issued !== undefined && !/^\d{4}-(0[1-9]|1[0-2])$/.test(c.issued)) {
      problems.push(`${c.id}: issued must be YYYY-MM`)
    }
    if (c.scan !== undefined && !(c.scan.startsWith('/') && exists(c.scan))) {
      problems.push(`${c.id}: scan file not found in public/ (${c.scan})`)
    }
  }
  const home = list.filter(c => c.home)
  if (home.length > 3) problems.push(`at most 3 certifications may have home: true (found ${home.length})`)
  const orders = home.map(c => c.homeOrder)
  orders.forEach((o, i) => orders.indexOf(o) !== i && problems.push(`homeOrder ${o} is used twice`))
  return problems
}

describe('projects', () => {
  test('the files on disk are valid (images exist in public/) and match the bundled content', () => {
    const fromFs = loadProjects(root)
    expect(fromFs.length).toBeGreaterThan(0)
    expect(projects).toEqual(fromFs)
  })

  test('every stack item renders as a logo, the chain mark or a code chip', () => {
    expect(projectProblems(projects)).toEqual([])
  })
})

describe('certifications', () => {
  test('ids unique, at most 3 on home, homeOrder unique, issued is YYYY-MM, scan exists', () => {
    expect(certificateProblems(certificates, inPublic)).toEqual([])
  })

  test('the check catches bad certifications', () => {
    const bad: Certificate[] = [
      { id: 'a', name: 'A', issuer: 'X', issued: '2025-4', home: true, homeOrder: 1 },
      { id: 'a', name: 'B', issuer: 'X', scan: '/images/certificates/missing.webp', home: true, homeOrder: 1 },
      { id: 'c', name: 'C', issuer: 'X', home: true, homeOrder: 2 },
      { id: 'd', name: 'D', issuer: 'X', home: true, homeOrder: 3 },
    ]
    expect(certificateProblems(bad, () => false)).toEqual([
      'id a is used twice',
      'a: issued must be YYYY-MM',
      'a: scan file not found in public/ (/images/certificates/missing.webp)',
      'at most 3 certifications may have home: true (found 4)',
      'homeOrder 1 is used twice',
    ])
  })
})

test('every tool on the home page has a logo', () => {
  for (const g of tools) for (const item of g.items) expect(techLogo(item).kind, item).toBe('logo')
})

describe('following docs/content-guide.md keeps the invariants', () => {
  let dir: string | undefined
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true })
    dir = undefined
  })

  test('adding a project', () => {
    dir = mkdtempSync(join(tmpdir(), 'content-'))
    for (const f of readdirSync(join(root, PROJECTS_DIR))) copyFileSync(join(root, PROJECTS_DIR, f), join(dir, f))
    const maxOrder = Math.max(...projects.map(p => p.order))
    writeFileSync(
      join(dir, 'my-project.md'),
      [
        '---',
        'name: My Project',
        'summary: A new project.',
        'category: Web apps',
        `order: ${maxOrder + 1}`,
        'stack: [React, Kafka, LangChain]',
        'repoUrl: https://github.com/example/my-project',
        '---',
        '## Problem',
        'p',
        '## Approach',
        'a',
        '## What I built',
        'b',
        '',
      ].join('\n'),
    )
    const next = loadProjects(root, dir)
    expect(next).toHaveLength(projects.length + 1)
    expect(next.find(p => p.slug === 'my-project')?.caseStudy?.built).toContain('b')
    expect(projectProblems(next)).toEqual([])
  })

  test('adding a certification', () => {
    const added: Certificate = {
      id: 'my-new-cert',
      name: 'My New Certification',
      issuer: 'Example Org',
      issued: '2026-10',
      verifyType: 'other',
      verifyUrl: 'https://example.com/verify',
    }
    expect(certificateProblems([...certificates, added], inPublic)).toEqual([])
  })
})
