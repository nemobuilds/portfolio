import { expect, test } from 'vitest'
import { verifyLabel } from './certifications'
import { leadLabel } from './experience'
import { techLogo } from './techLogos'
import { formatMonth } from './dates'

test('formatMonth', () => expect(formatMonth('2025-04')).toBe('April 2025'))
test('verifyLabel', () => {
  expect(verifyLabel('credly')).toBe('Verify on Credly')
  expect(verifyLabel('coursera')).toBe('Verify on Coursera')
  expect(verifyLabel('linkedin')).toBe('View on LinkedIn')
  expect(verifyLabel('other')).toBe('View credential')
  expect(verifyLabel(undefined)).toBe('View credential')
})
test('leadLabel', () => {
  const entry = { period: 'p', role: 'r', org: 'o', start: '2026-12' }
  expect(leadLabel(entry, new Date('2026-11-18'))).toBe('Next,')
  expect(leadLabel(entry, new Date('2027-01-01'))).toBe('Now,')
  expect(leadLabel({ period: 'p', role: 'r', org: 'o' }, new Date('2026-11-18'))).toBe('Now,')
})
test('techLogo', () => {
  expect(techLogo('React').kind).toBe('logo')
  expect(techLogo('LangChain').kind).toBe('chain')
  expect(techLogo('Kafka').kind).toBe('code')
  expect(techLogo('Spring Boot').kind).toBe('logo')
  expect(techLogo('C#').kind).toBe('logo')
})
