import { z } from 'zod'
import { CATEGORIES } from './types'

export class ContentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentError'
  }
}

const httpsUrl = z.string().url().refine(u => u.startsWith('https://'), 'must start with https://')
const imagePath = z.string().min(1)

export const frontmatterSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().min(1).optional(),
  categories: z
    .array(z.enum(CATEGORIES))
    .min(1)
    .refine((list) => new Set(list).size === list.length, 'must not list the same category twice'),
  // A bare 2026-09 in YAML is a string, so no Date coercion is needed.
  date: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'must be YYYY-MM, for example 2026-09')
    .optional(),
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

export function formatIssues(file: string, error: z.ZodError): string {
  return error.issues
    .map(i => `${file}: ${i.path.join('.') || '(root)'} ${i.message}`)
    .join('\n')
}
