// Plain content types. The browser imports only these; zod stays in schema.ts (build time).

// Filter groups on /projects, in display order. A project lists any of these
// names in `categories`. A category with no projects gets no checkbox.
export const PROJECT_FACETS = [
  {
    key: 'focus',
    label: 'Focus',
    options: ['Full-Stack Applications', 'Frontend & UI/UX', 'Backend & APIs', 'Mobile Apps', 'AI & Automation'],
  },
  {
    key: 'origin',
    label: 'Origin',
    options: ['Client Work', 'SaaS & Products', 'Open Source', 'Experiments & Prototypes', 'Personal Projects', 'Academic'],
  },
  {
    key: 'domain',
    label: 'Domain',
    options: [
      'Developer Tools',
      'Cloud & Infrastructure',
      'Data & Analytics',
      'E-Commerce & FinTech',
      'Education & Teams',
      'Games & Interactive',
    ],
  },
] as const

export type Category = (typeof PROJECT_FACETS)[number]['options'][number]
export const CATEGORIES = PROJECT_FACETS.flatMap((f) => f.options) as [Category, ...Category[]]

/** The project's categories that belong to one facet, in facet order. */
export function categoriesIn(facetKey: (typeof PROJECT_FACETS)[number]['key'], categories: readonly string[]): string[] {
  const facet = PROJECT_FACETS.find((f) => f.key === facetKey)!
  return facet.options.filter((o) => categories.includes(o))
}

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
  categories: Category[]
  /** Month the work started, YYYY-MM. Sorts Newest/Oldest first; undated projects go last. */
  date?: string
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
