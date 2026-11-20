import { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EMPTY_FILTER, readParams, togglePick, writeParams, type Facet, type FilterState } from './filter'

/** Search + category picks, kept in the URL so a filtered view is shareable. */
export function useFilterParams(facets: readonly Facet[]) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const key = params.toString()
  const state = useMemo(() => readParams(new URLSearchParams(key), facets), [key, facets])

  const go = useCallback(
    (next: FilterState) => navigate({ search: writeParams(next, facets) }, { replace: true }),
    [navigate, facets],
  )

  return {
    state,
    setQuery: (q: string) => go({ ...state, q }),
    toggle: (name: string) => go(togglePick(state, facets, name)),
    clearAll: () => go(EMPTY_FILTER),
  }
}
