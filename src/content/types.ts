// Plain content types. The browser imports only these; zod stays in schema.ts (build time).

export const CATEGORIES = ['Systems & backend', 'Full-stack & AI', 'Web apps'] as const
export type Category = (typeof CATEGORIES)[number]

export type CaseStudy = {
  problem: string
  approach: string
  built: string
  results?: string
  learned?: string
}

export type Project = {
  slug: string
  name: string
  summary: string
  description?: string
  category: Category
  order: number
  home: boolean
  homeOrder?: number
  stack: string[]
  repoUrl?: string
  liveUrl?: string
  isPrivate: boolean
  extraLinks: { label: string; url: string }[]
  role?: string
  period?: string
  cover?: { image?: string; video?: string; poster?: string }
  thumbnail?: string
  gallery: { src: string; caption: string }[]
  approachDiagram?: string
  caseStudy?: CaseStudy
}
