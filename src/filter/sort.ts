// Sorting for /projects and /certificates. Pure functions; the pages keep the
// chosen key in the URL as ?sort=<key>, and leave it out for the default.

export type SortOption<T> = {
  /** URL value, e.g. "az". */
  key: string
  label: string
  compare(a: T, b: T): number
}

export type SortConfig<T> = {
  options: readonly SortOption<T>[]
  /** Key of the default option. Must be one of options. */
  defaultKey: string
}

/** The sort key from the URL, or the default when it is missing or unknown. */
export function readSort<T>(params: URLSearchParams, config: SortConfig<T>): string {
  const wanted = params.get('sort')
  return config.options.some((o) => o.key === wanted) ? wanted! : config.defaultKey
}

/** Adds ?sort= (or &sort=) to a search string, unless the key is the default. */
export function withSort(search: string, key: string, defaultKey: string): string {
  if (key === defaultKey) return search
  return `${search}${search ? '&' : '?'}sort=${encodeURIComponent(key)}`
}

/**
 * A sorted copy. The sort is stable, so items that compare equal keep their
 * input order. Pass the items in the default order to get a sensible tie-break.
 */
export function sortItems<T>(items: readonly T[], config: SortConfig<T>, key: string): T[] {
  const option = config.options.find((o) => o.key === key) ?? config.options.find((o) => o.key === config.defaultKey)
  return option ? [...items].sort(option.compare) : [...items]
}

/** Case-insensitive A to Z on a text field. Use `reverse` for Z to A. */
export function byText<T>(get: (item: T) => string) {
  return (a: T, b: T) => get(a).localeCompare(get(b), 'en', { sensitivity: 'base', numeric: true })
}

export function reverse<T>(compare: (a: T, b: T) => number) {
  return (a: T, b: T) => compare(b, a)
}

/** Newest or oldest first on a YYYY-MM field. Undated items always go last. */
export function byMonth<T>(get: (item: T) => string | undefined, order: 'newest' | 'oldest') {
  return (a: T, b: T) => {
    const x = get(a)
    const y = get(b)
    if (x && y) return order === 'newest' ? y.localeCompare(x) : x.localeCompare(y)
    if (x) return -1
    if (y) return 1
    return 0
  }
}

/** Keeps the input order: for a "Featured" option on a list that is already in that order. */
export function keepOrder(): number {
  return 0
}
