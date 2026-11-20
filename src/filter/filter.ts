// Search + grouped category filters for /projects and /certificates.
// Pure functions only: the pages keep the state in the URL, these read and write it.

export type Facet = {
  /** URL param name, e.g. "focus". Never "q" or "category". */
  key: string
  /** Group title shown above its checkboxes. */
  label: string
  /** Category names in display order. Each name belongs to one facet only. */
  options: readonly string[]
}

export type FilterState = {
  q: string
  /** Facet key -> picked category names, in option order. */
  picked: Record<string, string[]>
}

export type Accessors<T> = {
  /** Text the search box matches against. */
  text(item: T): string
  categories(item: T): readonly string[]
}

export type FacetView = {
  key: string
  label: string
  options: { label: string; count: number; checked: boolean }[]
}

export const EMPTY_FILTER: FilterState = { q: '', picked: {} }

/** "Backend & APIs" -> "backend-apis", "Frontend & UI/UX" -> "frontend-ui-ux". */
export function categorySlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function inOptionOrder(facet: Facet, names: Iterable<string>): string[] {
  const set = new Set(names)
  return facet.options.filter((o) => set.has(o))
}

/**
 * Reads `?q=…&focus=a,b&domain=c`. Unknown slugs are dropped. The old single
 * `?category=<name>` link still works: it picks that name in its facet.
 */
export function readParams(params: URLSearchParams, facets: readonly Facet[]): FilterState {
  const picked: Record<string, string[]> = {}
  const legacy = params.get('category')
  for (const f of facets) {
    const slugs = new Set(params.getAll(f.key).flatMap((v) => v.split(',')).map((s) => s.trim()))
    const names = f.options.filter((o) => slugs.has(categorySlug(o)) || o === legacy)
    if (names.length) picked[f.key] = inOptionOrder(f, names)
  }
  return { q: params.get('q') ?? '', picked }
}

/** The search string for a state: "" when nothing is set, else "?q=…&focus=…". */
export function writeParams(state: FilterState, facets: readonly Facet[]): string {
  const parts: string[] = []
  // Keep inner and trailing spaces: the search box is controlled by this value,
  // so trimming here would eat the space a visitor just typed between two words.
  if (state.q.trim()) parts.push(`q=${encodeURIComponent(state.q)}`)
  for (const f of facets) {
    const names = inOptionOrder(f, state.picked[f.key] ?? [])
    if (names.length) parts.push(`${f.key}=${names.map(categorySlug).join(',')}`)
  }
  return parts.length ? `?${parts.join('&')}` : ''
}

/** Every word of the query appears somewhere in the text, case-insensitive. */
export function matchesQuery(text: string, q: string): boolean {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return true
  const hay = text.toLowerCase()
  return words.every((w) => hay.includes(w))
}

function matchesFacets<T>(item: T, state: FilterState, facets: readonly Facet[], get: Accessors<T>, skip?: string) {
  const cats = get.categories(item)
  return facets.every((f) => {
    if (f.key === skip) return true
    const picked = state.picked[f.key] ?? []
    return picked.length === 0 || picked.some((p) => cats.includes(p))
  })
}

/** OR inside a facet, AND across facets, AND the search query. Keeps input order. */
export function filterItems<T>(items: readonly T[], state: FilterState, facets: readonly Facet[], get: Accessors<T>): T[] {
  return items.filter((it) => matchesQuery(get.text(it), state.q) && matchesFacets(it, state, facets, get))
}

/**
 * Checkbox groups to draw. A category no item has gets no checkbox; a facet
 * with no checkboxes is left out. Each count is the result size if that
 * category were added to the current picks (the other facets still apply).
 */
export function facetViews<T>(items: readonly T[], state: FilterState, facets: readonly Facet[], get: Accessors<T>): FacetView[] {
  return facets
    .map((f) => {
      const searched = items.filter((it) => matchesQuery(get.text(it), state.q) && matchesFacets(it, state, facets, get, f.key))
      const picked = state.picked[f.key] ?? []
      const options = f.options
        .filter((o) => items.some((it) => get.categories(it).includes(o)))
        .map((o) => ({
          label: o,
          count: searched.filter((it) => get.categories(it).includes(o)).length,
          checked: picked.includes(o),
        }))
      return { key: f.key, label: f.label, options }
    })
    .filter((f) => f.options.length > 0)
}

export function togglePick(state: FilterState, facets: readonly Facet[], name: string): FilterState {
  const facet = facets.find((f) => f.options.includes(name))
  if (!facet) return state
  const now = state.picked[facet.key] ?? []
  const next = now.includes(name) ? now.filter((n) => n !== name) : inOptionOrder(facet, [...now, name])
  const picked = { ...state.picked }
  if (next.length) picked[facet.key] = next
  else delete picked[facet.key]
  return { ...state, picked }
}

/** Link to a list page filtered by one category: ("/projects", …, "Backend & APIs") -> "/projects?focus=backend-apis". */
export function filterHref(path: string, facets: readonly Facet[], name: string): string {
  return path + writeParams(togglePick(EMPTY_FILTER, facets, name), facets)
}

/** All picked names, facet by facet, in option order. */
export function pickedList(state: FilterState, facets: readonly Facet[]): string[] {
  return facets.flatMap((f) => inOptionOrder(f, state.picked[f.key] ?? []))
}

export function isFiltered(state: FilterState): boolean {
  return state.q.trim() !== '' || Object.values(state.picked).some((v) => v.length > 0)
}
