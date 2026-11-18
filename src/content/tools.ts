export type Craft = 'Backend' | 'Frontend' | 'AI & data' | 'QA & performance' | 'DevOps'

export const tools: { craft: Craft; items: string[] }[] = [
  { craft: 'Backend', items: ['Java', 'Spring Boot', 'C#', '.NET'] },
  { craft: 'Frontend', items: ['React', 'TypeScript', 'Angular', 'Tailwind CSS'] },
  { craft: 'AI & data', items: ['Python', 'FastAPI', 'PostgreSQL'] },
  { craft: 'QA & performance', items: ['Postman'] },
  { craft: 'DevOps', items: ['Docker', 'Git'] },
]
