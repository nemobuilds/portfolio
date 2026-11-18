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
  expect(homeProjects.map(p => p.slug)).toEqual(['tachyon', 'aws-s3-clone', 'lore-of-legends', 'zealia', 'ambition'])
})
test('nextProject wraps to the first', () => {
  expect(nextProject('ambition').slug).toBe('tachyon')
  expect(nextProject('tachyon').slug).toBe('aws-s3-clone')
})
test('every project stack name has a logo except the known chain and code items', () => {
  const special: Record<string, string> = { LangChain: 'chain', 'Spring Data JPA': 'code' }
  for (const p of projects) for (const s of p.stack) expect(techLogo(s).kind, s).toBe(special[s] ?? 'logo')
})
test('certificates sort newest first, undated last', () =>
  expect(certificates.map(c => c.id)).toEqual(['ccst-cybersecurity', 'intro-software-engineering', 'pcap']))
test('home certificates by homeOrder', () =>
  expect(homeCertificates.map(c => c.id)).toEqual(['ccst-cybersecurity', 'intro-software-engineering', 'pcap']))
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
