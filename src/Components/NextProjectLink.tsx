import { Link } from 'react-router-dom'
import type { Project } from '../content/projects'
import { Icon } from './Icon'

export function NextProjectLink({ project }: { project: Project }) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pt-24 pb-[72px]">
      <Link
        to={`/projects/${project.slug}`}
        className="inline-flex flex-wrap items-baseline gap-x-[18px] gap-y-1.5 text-[clamp(34px,5vw,60px)] font-bold leading-[1.05] tracking-[-0.035em] text-[var(--text)] no-underline hover:underline"
      >
        <span className="font-medium text-[var(--text-secondary)]">Next project:</span>
        <span>{project.name}</span>
        <span aria-hidden="true" className="inline-flex self-center">
          <Icon name="arrow" size={40} />
        </span>
      </Link>
    </section>
  )
}
