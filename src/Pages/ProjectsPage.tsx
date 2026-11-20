import { useEffect } from 'react'
import { Layout } from '../Components/Layout'
import { FilterLayout, SearchBox } from '../Components/Filters'
import ProjectCard from '../Components/ProjectCard'
import { countWord } from '../content/count'
import { projects, type Project } from '../content/projects'
import { PROJECT_FACETS } from '../content/types'
import { facetViews, filterItems, pickedList, type Accessors } from '../filter/filter'
import { byMonth, byText, keepOrder, reverse, sortItems, type SortConfig } from '../filter/sort'
import { useFilterParams } from '../filter/useFilterParams'

const access: Accessors<Project> = {
  text: (p) => [p.name, p.summary, p.description ?? '', p.stack.join(' ')].join(' '),
  categories: (p) => p.categories,
}

// `projects` arrives in `order`, so Featured keeps it and is the tie-break for the rest.
const PROJECT_SORT: SortConfig<Project> = {
  defaultKey: 'featured',
  options: [
    { key: 'featured', label: 'Featured', compare: keepOrder },
    { key: 'newest', label: 'Newest first', compare: byMonth((p: Project) => p.date, 'newest') },
    { key: 'oldest', label: 'Oldest first', compare: byMonth((p: Project) => p.date, 'oldest') },
    { key: 'az', label: 'A to Z', compare: byText((p: Project) => p.name) },
    { key: 'za', label: 'Z to A', compare: reverse(byText((p: Project) => p.name)) },
  ],
}

export default function ProjectsPage() {
  const { state, sort, setQuery, toggle, clearAll, setSort } = useFilterParams(PROJECT_FACETS, PROJECT_SORT)

  useEffect(() => {
    document.title = 'Projects · John Rogee Turqueza'
  }, [])

  const shown = sortItems(filterItems(projects, state, PROJECT_FACETS, access), PROJECT_SORT, sort)

  return (
    <Layout surface="sub" current="projects">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <section className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pt-12 pb-9">
          <div className="flex flex-col gap-[18px]">
            <h1 className="m-0 text-[clamp(48px,6vw,80px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-[var(--text)]">
              Projects
            </h1>
            <p className="m-0 text-[16px] text-[var(--text-secondary)] min-[760px]:text-[18px]">
              {countWord(projects.length)} projects. Each one opens a case study.
            </p>
          </div>
          <SearchBox label="Search projects" placeholder="Search by name, summary or tech" value={state.q} onChange={setQuery} />
        </section>
        <div className="pb-[88px]">
          <FilterLayout
            noun="projects"
            singular="project"
            views={facetViews(projects, state, PROJECT_FACETS, access)}
            state={state}
            picked={pickedList(state, PROJECT_FACETS)}
            total={projects.length}
            shown={shown.length}
            onToggle={toggle}
            onClearSearch={() => setQuery('')}
            onClearAll={clearAll}
            sort={{ options: PROJECT_SORT.options, value: sort, onChange: setSort }}
          >
            <div className="grid grid-cols-1 gap-6 min-[640px]:grid-cols-2">
              {shown.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </FilterLayout>
        </div>
      </div>
    </Layout>
  )
}
