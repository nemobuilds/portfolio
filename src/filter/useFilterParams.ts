import { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EMPTY_FILTER, readParams, togglePick, writeParams, type Facet, type FilterState } from './filter'
import { readSort, withSort, type SortConfig } from './sort'

/**
 * Search, category picks and sort, kept in the URL so a view is shareable.
 * Clear all resets search and picks but keeps the sort.
 */
export function useFilterParams<T>(facets: readonly Facet[], sortConfig: SortConfig<T>) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const key = params.toString()
  const state = useMemo(() => readParams(new URLSearchParams(key), facets), [key, facets])
  const sort = useMemo(() => readSort(new URLSearchParams(key), sortConfig), [key, sortConfig])

  const go = useCallback(
    (next: FilterState, nextSort: string) =>
      navigate({ search: withSort(writeParams(next, facets), nextSort, sortConfig.defaultKey) }, { replace: true }),
    [navigate, facets, sortConfig.defaultKey],
  )

  return {
    state,
    sort,
    setQuery: (q: string) => go({ ...state, q }, sort),
    toggle: (name: string) => go(togglePick(state, facets, name), sort),
    clearAll: () => go(EMPTY_FILTER, sort),
    setSort: (next: string) => go(state, next),
  }
}
