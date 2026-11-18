import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../Components/Layout'
import { FilterButtons } from '../Components/FilterButtons'
import ProjectCard from '../Components/ProjectCard'
import { EmptyState } from '../Components/EmptyState'
import { countWord } from '../content/count'
import { projects } from '../content/projects'

const ALL = 'All'

export default function ProjectsPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Projects · John Rogee Turqueza'
  }, [])

  const categories: string[] = [...new Set(projects.map((p) => p.category))]
  const options = [
    { label: ALL, count: projects.length },
    ...categories.map((c) => ({ label: c, count: projects.filter((p) => p.category === c).length })),
  ]
  const wanted = params.get('category')
  const selected = wanted && categories.includes(wanted) ? wanted : ALL
  const shown = selected === ALL ? projects : projects.filter((p) => p.category === selected)

  const select = (label: string) => {
    navigate({ search: label === ALL ? '' : `?category=${encodeURIComponent(label)}` }, { replace: true })
  }

  return (
    <Layout surface="sub" current="projects">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <section className="flex flex-col gap-[18px] pt-12 pb-9">
          <h1 className="m-0 text-[clamp(48px,6vw,80px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-[var(--text)]">
            Projects
          </h1>
          <p className="m-0 text-[16px] text-[var(--text-secondary)] min-[760px]:text-[18px]">
            {countWord(projects.length)} projects. Each one opens a case study.
          </p>
          <FilterButtons options={options} selected={selected} onSelect={select} />
        </section>
        <section className="pb-[88px]">
          {shown.length === 0 ? (
            <EmptyState message="No projects in this category yet." action={{ label: 'Show all projects', onClick: () => select(ALL) }} />
          ) : (
            <div className="grid grid-cols-1 gap-6 min-[760px]:grid-cols-2 min-[1100px]:grid-cols-3">
              {shown.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}
