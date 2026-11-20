import { useState } from 'react'
import type { Project } from '../content/projects'
import { SmartImage } from './SmartImage'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function ProjectCover({ project }: { project: Project }) {
  const { cover, name } = project
  const [reduced] = useState(prefersReducedMotion)
  if (!cover || (!cover.video && !cover.image)) return null
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pb-16" aria-label="Cover">
      <div className="relative after:absolute after:inset-0 after:translate-y-3 after:scale-x-[0.975] after:rounded-[10px] after:border after:border-[var(--card-edge)] after:bg-[color-mix(in_srgb,var(--card-fill)_82%,#000)] after:shadow-[0_30px_44px_-24px_rgba(0,0,0,0.6)] after:content-['']">
        <div className="surface-slate relative z-[1] rounded-[10px] p-2.5 shadow-[0_26px_36px_-18px_rgba(8,14,50,0.45)]">
          <div className="overflow-hidden rounded-[5px]">
            {cover.video ? (
              <video
                src={cover.video}
                poster={cover.poster}
                muted
                loop
                playsInline
                autoPlay={!reduced}
                controls={reduced}
                aria-label={`${name} screen recording`}
                className="block w-full object-cover object-top"
                style={{ aspectRatio: '16/8' }}
              />
            ) : (
              <SmartImage src={cover.image} alt={`${name} screenshot`} initial={name.charAt(0)} aspect="16/8" crop="top" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
