// Facts about today's content. These run in `npm test` only, not in the build's
// content check, so a valid content edit never fails `npm run build`.
// Update them when the content changes on purpose.
import { expect, test } from 'vitest'
import { certificates, getCertificate, homeCertificates } from '../content/certifications'
import { experience, leadLabel } from '../content/experience'
import { homeProjects, nextProject, projects } from '../content/projects'
import { techLogo } from '../content/techLogos'
import { site } from '../content/site'

test('five projects, home order', () => {
  expect(projects).toHaveLength(5)
  expect(homeProjects.map(p => p.slug)).toEqual(['endpoint', 'zealia', 'lore-of-legends', 'aws-s3-clone', 'ambition'])
})
test('nextProject wraps to the first', () => {
  expect(nextProject('ambition').slug).toBe('endpoint')
  expect(nextProject('endpoint').slug).toBe('aws-s3-clone')
})
test('project dates', () => {
  expect(Object.fromEntries(projects.map(p => [p.slug, p.date]))).toEqual({
    endpoint: '2026-09',
    'aws-s3-clone': '2026-05',
    'lore-of-legends': '2026-05',
    zealia: '2024-07',
    ambition: '2026-04',
  })
})
test('project categories', () => {
  expect(Object.fromEntries(projects.map(p => [p.slug, p.categories]))).toEqual({
    endpoint: ['Full-Stack Applications', 'Backend & APIs', 'Personal Projects', 'Open Source', 'Developer Tools', 'Cloud & Infrastructure'],
    'aws-s3-clone': ['Backend & APIs', 'Personal Projects', 'Experiments & Prototypes', 'Cloud & Infrastructure', 'Developer Tools'],
    'lore-of-legends': ['Full-Stack Applications', 'AI & Automation', 'Personal Projects', 'Experiments & Prototypes', 'Games & Interactive'],
    zealia: ['Full-Stack Applications', 'Academic', 'Education & Teams'],
    ambition: ['Frontend & UI/UX', 'Academic', 'Education & Teams'],
  })
})
test('certificate categories', () => {
  expect(Object.fromEntries(certificates.map(c => [c.id, c.categories]))).toEqual({
    'az-900': ['Cloud', 'Certification'],
    'ai-skills-fest-2026': ['AI', 'Event'],
    'understanding-data-engineering': ['Data', 'Course'],
    'intermediate-python': ['Programming', 'Data', 'Course'],
    'containerization-virtualization': ['DevOps & Containers', 'Cloud', 'Course'],
    'python-for-developers': ['Programming', 'Course'],
    'intro-python': ['Programming', 'Data', 'Course'],
    'ccst-cybersecurity': ['Security & Networking', 'Certification'],
    'innolympics-2025': ['Software Engineering', 'Event'],
    'intro-software-engineering': ['Software Engineering', 'Course'],
    'software-engineering-essentials': ['Software Engineering', 'Course'],
    'intro-packet-tracer': ['Security & Networking', 'Course'],
    pcap: ['Programming', 'Course'],
    'integrated-programming-technologies-1': ['Programming', 'Course'],
  })
  expect(getCertificate('software-engineering-essentials')).toMatchObject({ issuer: 'IBM', via: 'Coursera' })
})
test('every project stack name has a logo except the known chain and code items', () => {
  const special: Record<string, string> = { LangChain: 'chain', 'Spring Data JPA': 'code', 'Next.js': 'code', Composer: 'code' }
  for (const p of projects) for (const s of p.stack) expect(techLogo(s).kind, s).toBe(special[s] ?? 'logo')
})
test('certificates sort newest first, undated last', () =>
  expect(certificates.map(c => c.id)).toEqual([
    'az-900', 'ai-skills-fest-2026', 'understanding-data-engineering',
    'intermediate-python', 'containerization-virtualization',
    'python-for-developers', 'intro-python', 'ccst-cybersecurity', 'innolympics-2025',
    'intro-software-engineering', 'software-engineering-essentials',
    'intro-packet-tracer', 'pcap', 'integrated-programming-technologies-1',
  ]))
test('home certificates by homeOrder', () =>
  expect(homeCertificates.map(c => c.id)).toEqual(['az-900', 'ccst-cybersecurity', 'pcap']))
test('getCertificate', () => {
  expect(getCertificate('pcap')?.issuer).toMatch(/OpenEDG/)
  expect(getCertificate('nope')).toBeUndefined()
})
test('the lead entry starts in December 2026', () => {
  expect(leadLabel(experience[0], new Date('2026-11-18'))).toBe('Next,')
  expect(leadLabel(experience[0], new Date('2027-01-01'))).toBe('Now,')
})
test('experience order', () => {
  expect(experience.map(e => e.role)).toEqual([
    'API Engineer', 'Software Test Engineer', 'Software QA Tester',
    '4th-Year Representative', 'BS Computer Science',
  ])
})
test('site config', () => {
  expect(site.brand).toBe('nemo')
  expect(site.social.github).toMatch(/^https:\/\//)
})
