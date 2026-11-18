import { z } from 'zod'

export class ContentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentError'
  }
}

export const CATEGORIES = ['Systems & backend', 'Full-stack & AI', 'Web apps'] as const
export type Category = (typeof CATEGORIES)[number]

export type CaseStudy = {
  problem: string
  approach: string
  built: string
  results?: string
  learned?: string
}

const httpsUrl = z.string().url().refine(u => u.startsWith('https://'), 'must start with https://')
const imagePath = z.string().min(1)

export const frontmatterSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().min(1).optional(),
  category: z.enum(CATEGORIES),
  order: z.number().int(),
  home: z.boolean().default(false),
  homeOrder: z.number().int().optional(),
  stack: z.array(z.string().min(1)).min(1),
  repoUrl: httpsUrl.optional(),
  liveUrl: httpsUrl.optional(),
  private: z.boolean().default(false),
  extraLinks: z.array(z.object({ label: z.string().min(1), url: httpsUrl })).default([]),
  role: z.string().min(1).optional(),
  period: z.string().min(1).optional(),
  cover: z
    .object({ image: imagePath.optional(), video: imagePath.optional(), poster: imagePath.optional() })
    .optional(),
  thumbnail: imagePath.optional(),
  gallery: z.array(z.object({ src: imagePath, caption: z.string() })).default([]),
  approachDiagram: imagePath.optional(),
})

export type Frontmatter = z.infer<typeof frontmatterSchema>

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

export function formatIssues(file: string, error: z.ZodError): string {
  return error.issues
    .map(i => `${file}: ${i.path.join('.') || '(root)'} ${i.message}`)
    .join('\n')
}
