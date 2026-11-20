import { useEffect } from 'react'
import { Layout } from '../Components/Layout'
import { FilterLayout, SearchBox } from '../Components/Filters'
import ProjectCard from '../Components/ProjectCard'
import { countWord } from '../content/count'
import { projects, type Project } from '../content/projects'
import { PROJECT_FACETS } from '../content/types'
import { facetViews, filterItems, pickedList, type Accessors } from '../filter/filter'
import { useFilterParams } from '../filter/useFilterParams'

const access: Accessors<Project> = {
  text: (p) => [p.name, p.summary, p.description ?? '', p.stack.join(' ')].join(' '),
  categories: (p) => p.categories,
}

export default function ProjectsPage() {
  const { state, setQuery, toggle, clearAll } = useFilterParams(PROJECT_FACETS)

  useEffect(() => {
    document.title = 'Projects · John Rogee Turqueza'
  }, [])

  const shown = filterItems(projects, state, PROJECT_FACETS, access)

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
