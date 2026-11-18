import { useState } from 'react'
import type { Project } from '../content/projects'
import { Button } from './Button'
import { ProjectLinks } from './ProjectLinks'
import { SmartImage } from './SmartImage'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function PreviewStage({ project }: { project: Project }) {
  const { cover, name, summary, caseStudy } = project
  const [reduced] = useState(prefersReducedMotion)
  return (
    <div
      role="region"
      aria-label="Project preview"
      aria-live="polite"
      className="surface-glass min-w-0 rounded-[10px] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_26px_36px_-18px_rgba(8,14,50,0.4)] min-[760px]:p-2.5"
    >
      <div className="overflow-hidden rounded-[5px] bg-[radial-gradient(ellipse_at_50%_120%,#1A2A6A,#05080F_62%)]">
        {cover?.video ? (
          <video
            key={project.slug}
            src={cover.video}
            poster={cover.poster}
            muted
            loop
            playsInline
            autoPlay={!reduced}
            controls={reduced}
            aria-label={`${name} screen recording`}
            className="block w-full object-cover"
            style={{ aspectRatio: '16/8' }}
          />
        ) : (
          <SmartImage key={project.slug} src={cover?.image} alt={`${name} screenshot`} initial={name.charAt(0)} aspect="16/8" />
        )}
      </div>
      <div className="flex flex-col gap-2 px-1 pt-3 pb-1 min-[760px]:px-2">
        <h3 className="m-0 text-[24px] font-bold" style={{ letterSpacing: '-0.03em' }}>{name}</h3>
        <p className="m-0 text-[14px] text-[#3A4058]">{summary}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            surface="ink"
            to={`/projects/${project.slug}`}
            trailingIcon="arrow"
            label={caseStudy ? 'Read the case study' : 'Details'}
          />
          <ProjectLinks
            repoUrl={project.repoUrl}
            liveUrl={project.liveUrl}
            isPrivate={project.isPrivate}
            extras={project.extraLinks}
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}
