// Build-time only: the Vite content plugin (plugins/contentPlugin.ts) runs this,
// so zod, yaml and marked never reach the browser bundle.
import { marked } from 'marked'
import { parseFrontmatter } from './frontmatter'
import { ContentError, formatIssues, frontmatterSchema } from './schema'
import type { CaseStudy, Project } from './types'

const SECTIONS = {
  Problem: 'problem',
  Approach: 'approach',
  'What I built': 'built',
  Results: 'results',
  Learned: 'learned',
} as const satisfies Record<string, keyof CaseStudy>

const render = (md: string) => marked.parse(md.trim(), { async: false })

export function parseCaseStudy(body: string, file: string): CaseStudy | undefined {
  if (body.trim() === '') return undefined
  const found: Partial<Record<keyof CaseStudy, string>> = {}
  let key: keyof CaseStudy | undefined
  let buf: string[] = []
  const flush = () => {
    if (key) found[key] = buf.join('\n')
    buf = []
  }
  for (const line of body.split(/\r?\n/)) {
    const m = /^## (.*?)\s*$/.exec(line)
    if (m) {
      flush()
      const title = m[1]
      if (!(title in SECTIONS)) {
        throw new ContentError(
          `${file}: body heading "## ${title}" is not allowed. Use ${Object.keys(SECTIONS).map(s => `"## ${s}"`).join(', ')}`,
        )
      }
      key = SECTIONS[title as keyof typeof SECTIONS]
      if (key in found) throw new ContentError(`${file}: body heading "## ${title}" appears twice`)
      found[key] = ''
    } else if (key) {
      buf.push(line)
    } else if (line.trim() !== '') {
      throw new ContentError(`${file}: body text before the first "## " heading`)
    }
  }
  flush()
  for (const [title, k] of Object.entries(SECTIONS)) {
    if (['problem', 'approach', 'built'].includes(k) && !found[k]?.trim()) {
      throw new ContentError(`${file}: body is missing required section "## ${title}"`)
    }
  }
  const html = (k: keyof CaseStudy) => (found[k]?.trim() ? render(found[k]!) : undefined)
  return {
    problem: html('problem')!,
    approach: html('approach')!,
    built: html('built')!,
    ...(html('results') && { results: html('results') }),
    ...(html('learned') && { learned: html('learned') }),
  }
}

export function validateProjects(
  files: Record<string, string>,
  fileExists: (publicPath: string) => boolean,
): Project[] {
  const out: Project[] = []
  for (const [file, raw] of Object.entries(files)) {
    const slug = (file.split(/[\\/]/).pop() ?? '').replace(/\.md$/, '')
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new ContentError(`${file}: slug "${slug}" must match ^[a-z0-9-]+$`)
    }
    const { data, body } = parseFrontmatter(raw)
    const parsed = frontmatterSchema.safeParse(data ?? {})
    if (!parsed.success) throw new ContentError(formatIssues(file, parsed.error))
    const { private: isPrivate, ...fm } = parsed.data

    if (fm.home && fm.homeOrder === undefined) {
      throw new ContentError(`${file}: homeOrder is required when home is true`)
    }

    const images: [string, string | undefined][] = [
      ['cover.image', fm.cover?.image],
      ['cover.video', fm.cover?.video],
      ['cover.poster', fm.cover?.poster],
      ['thumbnail', fm.thumbnail],
      ['approachDiagram', fm.approachDiagram],
      ...fm.gallery.map((g, i): [string, string] => [`gallery.${i}.src`, g.src]),
    ]
    const prefix = `/images/projects/${slug}/`
    for (const [field, p] of images) {
      if (p === undefined) continue
      if (!p.startsWith(prefix)) throw new ContentError(`${file}: ${field} must start with ${prefix}`)
      if (!fileExists(p)) throw new ContentError(`${file}: ${field} file not found in public/ (${p})`)
    }

    out.push({ ...fm, slug, isPrivate, caseStudy: parseCaseStudy(body, file) })
  }

  const dupe = (vals: number[]) => vals.find((v, i) => vals.indexOf(v) !== i)
  const d1 = dupe(out.map(p => p.order))
  if (d1 !== undefined) throw new ContentError(`order ${d1} is used by more than one project; order must be unique`)
  const home = out.filter(p => p.home)
  const d2 = dupe(home.map(p => p.homeOrder!))
  if (d2 !== undefined) throw new ContentError(`homeOrder ${d2} is used by more than one project; homeOrder must be unique`)
  if (home.length > 5) throw new ContentError(`at most 5 projects may have home: true (found ${home.length})`)

  return out.sort((a, b) => a.order - b.order)
}
