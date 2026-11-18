import { parse } from 'yaml'

export function parseFrontmatter(raw: string): { data: unknown; body: string } {
  const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/)
  if (lines[0]?.trim() !== '---') return { data: undefined, body: raw }
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---')
  if (end === -1) return { data: undefined, body: raw }
  return {
    data: parse(lines.slice(1, end).join('\n')),
    body: lines.slice(end + 1).join('\n'),
  }
}
