import { expect, test } from 'vitest'
import { certificates, homeCertificates, verifyLabel, getCertificate } from './certifications'
import { experience, leadLabel } from './experience'
import { tools } from './tools'
import { techLogo } from './techLogos'
import { formatMonth } from './dates'
import { projects } from './projects'
import { site } from './site'

test('formatMonth', () => expect(formatMonth('2025-04')).toBe('April 2025'))
test('certificates sort newest first, undated last', () =>
  expect(certificates.map(c => c.id)).toEqual(['ccst-cybersecurity', 'intro-software-engineering', 'pcap']))
test('verifyLabel', () => {
  expect(verifyLabel('credly')).toBe('Verify on Credly')
  expect(verifyLabel('coursera')).toBe('Verify on Coursera')
  expect(verifyLabel('linkedin')).toBe('View on LinkedIn')
  expect(verifyLabel('other')).toBe('View credential')
  expect(verifyLabel(undefined)).toBe('View credential')
})
test('getCertificate', () => {
  expect(getCertificate('pcap')?.issuer).toMatch(/OpenEDG/)
  expect(getCertificate('nope')).toBeUndefined()
})
test('leadLabel', () => {
  expect(leadLabel(experience[0], new Date('2026-11-18'))).toBe('Next,')
  expect(leadLabel(experience[0], new Date('2027-01-01'))).toBe('Now,')
})
test('experience order', () => {
  expect(experience.map(e => e.role)).toEqual([
    'API Engineer', 'Software Test Engineer', 'Software QA Tester',
    '4th-Year Representative', 'BS Computer Science',
  ])
})
test('techLogo', () => {
  expect(techLogo('React').kind).toBe('logo')
  expect(techLogo('LangChain').kind).toBe('chain')
  expect(techLogo('Kafka').kind).toBe('code')
  expect(techLogo('Spring Boot').kind).toBe('logo')
  expect(techLogo('C#').kind).toBe('logo')
})
test('every project and tool name with a logo resolves', () => {
  for (const g of tools) for (const item of g.items) expect(techLogo(item).kind, item).toBe('logo')
  const special: Record<string, string> = { LangChain: 'chain', 'Spring Data JPA': 'code' }
  for (const p of projects) for (const s of p.stack) expect(techLogo(s).kind, s).toBe(special[s] ?? 'logo')
})
test('certificate ids are unique, at most 3 on home, homeOrder unique', () => {
  const ids = certificates.map(c => c.id)
  expect(new Set(ids).size).toBe(ids.length)
  expect(homeCertificates.length).toBeLessThanOrEqual(3)
  const orders = homeCertificates.map(c => c.homeOrder)
  expect(new Set(orders).size).toBe(orders.length)
  expect(homeCertificates.map(c => c.id)).toEqual(['ccst-cybersecurity', 'intro-software-engineering', 'pcap'])
})
test('site config', () => {
  expect(site.brand).toBe('nemo')
  expect(site.social.github).toMatch(/^https:\/\//)
})
