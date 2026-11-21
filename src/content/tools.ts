export type Craft = 'Backend' | 'Frontend' | 'AI & data' | 'QA & performance' | 'DevOps'

export const tools: { craft: Craft; items: string[] }[] = [
  { craft: 'Backend', items: ['Java', 'Spring Boot', 'PHP', 'FastAPI'] },
  { craft: 'Frontend', items: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS'] },
  { craft: 'AI & data', items: ['Python', 'MySQL', 'PostgreSQL'] },
  { craft: 'QA & performance', items: ['Postman', 'JMeter'] },
  { craft: 'DevOps', items: ['Azure', 'Docker', 'Git'] },
]
