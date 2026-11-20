import { Link } from 'react-router-dom'
import type { Project } from '../content/projects'
import { categoriesIn } from '../content/types'
import { CategoryPill, CategoryPills } from './CategoryPill'
import { Icon } from './Icon'
import { SmartImage } from './SmartImage'
import { StackList } from './StackList'

// Card pills are plain text: the whole card is already one link.
const MAX_PILLS = 3

const linkBase =
  'relative z-10 inline-flex items-center gap-1.5 min-h-11 text-[14px] font-semibold no-underline hover:underline underline-offset-[3px]'

export default function ProjectCard({ project }: { project: Project }) {
  const to = `/projects/${project.slug}`
  const focus = categoriesIn('focus', project.categories)
  return (
    <article className="surface-slate relative flex flex-col overflow-hidden rounded-[10px] shadow-[0_26px_36px_-18px_rgba(8,14,50,0.45)]">
      <SmartImage src={project.thumbnail} alt="" initial={project.name.charAt(0)} aspect="16/10" />
      <div className="flex flex-1 flex-col gap-2.5 px-[22px] pt-5 pb-[22px]">
        <h3 className="m-0 text-[22px] font-bold tracking-[-0.02em] line-clamp-2">
          <Link to={to} className="text-[var(--text)] no-underline after:absolute after:inset-0 after:content-['']">
            {project.name}
          </Link>
        </h3>
        <p className="m-0 text-[15px] leading-normal text-[var(--text-secondary)] line-clamp-3">{project.summary}</p>
        {focus.length > 0 && (
          <CategoryPills label="Focus">
            {focus.slice(0, MAX_PILLS).map((c) => (
              <li key={c}>
                <CategoryPill label={c} />
              </li>
            ))}
            {focus.length > MAX_PILLS && (
              <li title={focus.slice(MAX_PILLS).join(', ')}>
                <CategoryPill label={`+${focus.length - MAX_PILLS}`} variant="outline" />
              </li>
            )}
          </CategoryPills>
        )}
        <StackList items={project.stack} limit={4} />
        <div className="mt-auto flex flex-wrap items-center gap-x-[18px] gap-y-1 pt-2">
          <Link to={to} className={`${linkBase} text-[var(--text)]`}>
            <span>{project.caseStudy ? 'Case study' : 'Details'}</span>
            <Icon name="arrow" size={16} />
          </Link>
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noreferrer" className={`${linkBase} text-[var(--text)] underline`}>
              <span>GitHub</span>
              <Icon name="external" size={16} />
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className={`${linkBase} text-[var(--text)] underline`}>
              <span>Live demo</span>
              <Icon name="external" size={16} />
            </a>
          )}
          {project.isPrivate && (
            <span className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-medium text-[var(--text-secondary)]">
              <Icon name="lock" size={16} />
              <span>Code is private</span>
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
