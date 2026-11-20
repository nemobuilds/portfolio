import { describe, expect, test } from 'vitest'
import { byMonth, byText, keepOrder, readSort, reverse, sortItems, withSort, type SortConfig } from './sort'

type Item = { name: string; date?: string; issuer: string }
const items: Item[] = [
  { name: 'beta', date: '2025-06', issuer: 'Zed' },
  { name: 'Alpha', issuer: 'Acme' },
  { name: 'gamma', date: '2026-01', issuer: 'Acme' },
  { name: 'delta', date: '2025-06', issuer: 'Acme' },
]
const name = (i: Item) => i.name
const config: SortConfig<Item> = {
  defaultKey: 'featured',
  options: [
    { key: 'featured', label: 'Featured', compare: keepOrder },
    { key: 'newest', label: 'Newest first', compare: byMonth((i: Item) => i.date, 'newest') },
    { key: 'oldest', label: 'Oldest first', compare: byMonth((i: Item) => i.date, 'oldest') },
    { key: 'az', label: 'A to Z', compare: byText(name) },
    { key: 'za', label: 'Z to A', compare: reverse(byText(name)) },
    { key: 'issuer', label: 'Issuer A to Z', compare: byText((i: Item) => i.issuer) },
  ],
}
const sorted = (key: string) => sortItems(items, config, key).map(name)

describe('sortItems', () => {
  test('the default keeps the input order and does not change the input', () => {
    expect(sorted('featured')).toEqual(['beta', 'Alpha', 'gamma', 'delta'])
    expect(items.map(name)).toEqual(['beta', 'Alpha', 'gamma', 'delta'])
  })
  test('A to Z ignores case; Z to A is the reverse', () => {
    expect(sorted('az')).toEqual(['Alpha', 'beta', 'delta', 'gamma'])
    expect(sorted('za')).toEqual(['gamma', 'delta', 'beta', 'Alpha'])
  })
  test('newest and oldest put undated items last, and ties keep the input order', () => {
    expect(sorted('newest')).toEqual(['gamma', 'beta', 'delta', 'Alpha'])
    expect(sorted('oldest')).toEqual(['beta', 'delta', 'gamma', 'Alpha'])
  })
  test('issuer A to Z keeps the input order inside one issuer', () => {
    expect(sorted('issuer')).toEqual(['Alpha', 'gamma', 'delta', 'beta'])
  })
  test('an unknown key falls back to the default', () => {
    expect(sorted('nope')).toEqual(sorted('featured'))
  })
})

describe('sort in the URL', () => {
  test('readSort returns a known key, else the default', () => {
    expect(readSort(new URLSearchParams('sort=az'), config)).toBe('az')
    expect(readSort(new URLSearchParams('sort=nope'), config)).toBe('featured')
    expect(readSort(new URLSearchParams(''), config)).toBe('featured')
  })
  test('withSort leaves the default out and joins with the other params', () => {
    expect(withSort('', 'featured', 'featured')).toBe('')
    expect(withSort('', 'az', 'featured')).toBe('?sort=az')
    expect(withSort('?q=x&focus=a', 'oldest', 'featured')).toBe('?q=x&focus=a&sort=oldest')
  })
})
