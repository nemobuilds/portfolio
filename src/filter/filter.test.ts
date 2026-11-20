import { describe, expect, test } from 'vitest'
import {
  EMPTY_FILTER,
  categorySlug,
  facetViews,
  filterHref,
  filterItems,
  isFiltered,
  matchesQuery,
  pickedList,
  readParams,
  togglePick,
  writeParams,
  type Facet,
  type FilterState,
} from './filter'

const facets: Facet[] = [
  { key: 'focus', label: 'Focus', options: ['Backend & APIs', 'Frontend & UI/UX', 'Mobile Apps'] },
  { key: 'domain', label: 'Domain', options: ['Developer Tools', 'Games & Interactive'] },
]

type Item = { name: string; stack: string[]; cats: string[] }
const items: Item[] = [
  { name: 'Alpha', stack: ['Spring Boot'], cats: ['Backend & APIs', 'Developer Tools'] },
  { name: 'Beta', stack: ['React'], cats: ['Frontend & UI/UX', 'Games & Interactive'] },
  { name: 'Gamma', stack: ['Spring Boot', 'React'], cats: ['Backend & APIs', 'Frontend & UI/UX', 'Games & Interactive'] },
]
const get = { text: (i: Item) => `${i.name} ${i.stack.join(' ')}`, categories: (i: Item) => i.cats }
const names = (list: Item[]) => list.map((i) => i.name)
const state = (q: string, picked: FilterState['picked'] = {}): FilterState => ({ q, picked })

describe('categorySlug', () => {
  test('lowercases and joins words with single hyphens', () => {
    expect(categorySlug('Backend & APIs')).toBe('backend-apis')
    expect(categorySlug('Frontend & UI/UX')).toBe('frontend-ui-ux')
    expect(categorySlug('AI')).toBe('ai')
  })
})

describe('matchesQuery', () => {
  test('empty query matches everything', () => {
    expect(matchesQuery('anything', '   ')).toBe(true)
  })
  test('every word must appear, in any order and case', () => {
    expect(matchesQuery('Spring Boot PostgreSQL', 'postgres spring')).toBe(true)
    expect(matchesQuery('Spring Boot PostgreSQL', 'spring kafka')).toBe(false)
  })
})

describe('filterItems', () => {
  test('no state returns every item in order', () => {
    expect(names(filterItems(items, EMPTY_FILTER, facets, get))).toEqual(['Alpha', 'Beta', 'Gamma'])
  })
  test('picks in one facet are OR', () => {
    const s = state('', { focus: ['Backend & APIs', 'Frontend & UI/UX'] })
    expect(names(filterItems(items, s, facets, get))).toEqual(['Alpha', 'Beta', 'Gamma'])
  })
  test('picks across facets are AND', () => {
    const s = state('', { focus: ['Backend & APIs'], domain: ['Games & Interactive'] })
    expect(names(filterItems(items, s, facets, get))).toEqual(['Gamma'])
  })
  test('search and picks work together', () => {
    expect(names(filterItems(items, state('react', { focus: ['Backend & APIs'] }), facets, get))).toEqual(['Gamma'])
    expect(names(filterItems(items, state('kotlin'), facets, get))).toEqual([])
  })
})

describe('facetViews', () => {
  test('hides categories with no items and facets with no categories', () => {
    const views = facetViews(items, EMPTY_FILTER, facets, get)
    expect(views.map((v) => v.options.map((o) => o.label))).toEqual([
      ['Backend & APIs', 'Frontend & UI/UX'],
      ['Developer Tools', 'Games & Interactive'],
    ])
    const onlyDomain = facetViews(items, EMPTY_FILTER, [{ key: 'x', label: 'X', options: ['Nope'] }, facets[1]], get)
    expect(onlyDomain.map((v) => v.key)).toEqual(['domain'])
  })
  test('counts follow the search and the other facets, not their own', () => {
    const s = state('', { focus: ['Backend & APIs'] })
    const [focus, domain] = facetViews(items, s, facets, get)
    expect(focus.options).toEqual([
      { label: 'Backend & APIs', count: 2, checked: true },
      { label: 'Frontend & UI/UX', count: 2, checked: false },
    ])
    expect(domain.options.map((o) => o.count)).toEqual([1, 1])
    const searched = facetViews(items, state('beta'), facets, get)
    expect(searched[0].options.map((o) => o.count)).toEqual([0, 1])
  })
})

describe('togglePick', () => {
  test('adds in option order and removes, dropping empty facets', () => {
    let s = togglePick(EMPTY_FILTER, facets, 'Frontend & UI/UX')
    s = togglePick(s, facets, 'Backend & APIs')
    expect(s.picked).toEqual({ focus: ['Backend & APIs', 'Frontend & UI/UX'] })
    s = togglePick(togglePick(s, facets, 'Backend & APIs'), facets, 'Frontend & UI/UX')
    expect(s.picked).toEqual({})
  })
  test('an unknown name changes nothing', () => {
    expect(togglePick(EMPTY_FILTER, facets, 'Nope')).toBe(EMPTY_FILTER)
  })
})

describe('URL params', () => {
  test('write then read round-trips', () => {
    const s = state('spring boot', { focus: ['Frontend & UI/UX', 'Backend & APIs'], domain: ['Developer Tools'] })
    const search = writeParams(s, facets)
    expect(search).toBe('?q=spring%20boot&focus=backend-apis,frontend-ui-ux&domain=developer-tools')
    expect(readParams(new URLSearchParams(search), facets)).toEqual({
      q: 'spring boot',
      picked: { focus: ['Backend & APIs', 'Frontend & UI/UX'], domain: ['Developer Tools'] },
    })
  })
  test('empty state writes an empty string', () => {
    expect(writeParams(state('  '), facets)).toBe('')
  })
  test('a trailing space survives, so the visitor can type the next word', () => {
    expect(writeParams(state('spring '), facets)).toBe('?q=spring%20')
  })
  test('unknown slugs are dropped and repeated params are merged', () => {
    const s = readParams(new URLSearchParams('focus=nope&focus=mobile-apps,backend-apis'), facets)
    expect(s.picked).toEqual({ focus: ['Backend & APIs', 'Mobile Apps'] })
  })
  test('the old ?category=<name> link still picks that category', () => {
    expect(readParams(new URLSearchParams('category=Developer%20Tools'), facets).picked).toEqual({ domain: ['Developer Tools'] })
    expect(readParams(new URLSearchParams('category=Nope'), facets)).toEqual(EMPTY_FILTER)
  })
})

describe('filterHref', () => {
  test('links to the list filtered by one category', () => {
    expect(filterHref('/projects', facets, 'Frontend & UI/UX')).toBe('/projects?focus=frontend-ui-ux')
    expect(filterHref('/projects', facets, 'Developer Tools')).toBe('/projects?domain=developer-tools')
  })
  test('an unknown category links to the plain list', () => {
    expect(filterHref('/projects', facets, 'Nope')).toBe('/projects')
  })
})

describe('pickedList and isFiltered', () => {
  test('lists picks facet by facet', () => {
    const s = state('', { domain: ['Developer Tools'], focus: ['Mobile Apps'] })
    expect(pickedList(s, facets)).toEqual(['Mobile Apps', 'Developer Tools'])
  })
  test('a blank query alone is not a filter', () => {
    expect(isFiltered(state('  '))).toBe(false)
    expect(isFiltered(state('x'))).toBe(true)
    expect(isFiltered(state('', { focus: ['Mobile Apps'] }))).toBe(true)
  })
})
