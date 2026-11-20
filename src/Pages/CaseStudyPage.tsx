import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '../Components/Layout'
import { ProjectLinks } from '../Components/ProjectLinks'
import { ProjectCover } from '../Components/ProjectCover'
import { FactsRail } from '../Components/FactsRail'
import { StorySection } from '../Components/StorySection'
import { Gallery } from '../Components/Gallery'
import { NextProjectLink } from '../Components/NextProjectLink'
import { SmartImage } from '../Components/SmartImage'
import { getProject, nextProject } from '../content/projects'
import type { Project } from '../content/projects'
import NotFoundPage from './NotFoundPage'

const rule = 'color-mix(in_srgb,var(--text)_8%,transparent)'
const sheet = [
  'surface-slate relative flex flex-col gap-11 overflow-hidden rounded-[10px] px-5 py-8 pl-11',
  'shadow-[0_26px_36px_-18px_rgba(8,14,50,0.45)] min-[760px]:py-12 min-[760px]:pr-12 min-[760px]:pl-[92px]',
  `before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-[repeating-linear-gradient(180deg,transparent_0,transparent_27px,${rule}_27px,${rule}_28px)]`,
  "after:pointer-events-none after:absolute after:inset-y-0 after:left-7 after:w-px after:bg-[var(--accent)] after:opacity-55 after:content-[''] min-[760px]:after:left-[62px]",
  '[&>*]:relative [&>*]:z-[1]',
].join(' ')

export function CaseStudyView({ project }: { project: Project }) {
  const { name, summary, description, caseStudy: cs } = project
  const next = nextProject(project.slug)
  const hasLinks = !!project.repoUrl || !!project.liveUrl || project.isPrivate || project.extraLinks.length > 0

  useEffect(() => {
    document.title = `${name} · John Rogee Turqueza`
  }, [name])

  const links = (
    <ProjectLinks
      repoUrl={project.repoUrl}
      liveUrl={project.liveUrl}
      isPrivate={project.isPrivate}
      extras={project.extraLinks}
    />
  )

  return (
    <Layout surface="sub" current="projects" backLink>
      <section className="mx-auto w-full max-w-[1200px] px-6 pt-14 pb-10">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div className="flex min-w-0 flex-col gap-3.5">
            <h1 className="m-0 text-[clamp(52px,7vw,116px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-[var(--text)]">
              {name}
            </h1>
            <p className="m-0 max-w-[52ch] text-[20px] leading-[1.45] text-[var(--text-secondary)]">{summary}</p>
            {hasLinks && <div className="min-[760px]:hidden">{links}</div>}
          </div>
          {hasLinks && <div className="hidden pb-2.5 min-[760px]:block">{links}</div>}
        </div>
      </section>

      <ProjectCover project={project} />

      <section className="mx-auto w-full max-w-[1200px] px-6">
        <div className="grid grid-cols-1 items-start gap-10 min-[900px]:grid-cols-[320px_minmax(0,1fr)]">
          <FactsRail project={project} />
          <article className={sheet}>
            {cs ? (
              <>
                <StorySection title="Problem" html={cs.problem} />
                <StorySection title="Approach" html={cs.approach}>
                  {project.approachDiagram && (
                    <div className="overflow-hidden rounded-md">
                      <SmartImage src={project.approachDiagram} alt={`${name} approach diagram`} aspect="16/9" crop="top" />
                    </div>
                  )}
                </StorySection>
                <StorySection title="What I built" html={cs.built} />
                {cs.results && <StorySection title="Results" html={cs.results} />}
                {cs.learned && <StorySection title="Learned" html={cs.learned} />}
              </>
            ) : (
              <StorySection title="What it is">
                <p className="m-0">{description ?? summary}</p>
              </StorySection>
            )}
          </article>
        </div>
      </section>

      <Gallery items={project.gallery} />
      <NextProjectLink project={next} />
    </Layout>
  )
}

export default function CaseStudyPage() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined
  if (!project) return <NotFoundPage variant="project" />
  return <CaseStudyView key={project.slug} project={project} />
}
