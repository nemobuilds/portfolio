import { useState } from 'react'
import { homeProjects } from '../content/projects'
import { Button } from '../Components/Button'
import { PreviewStage } from '../Components/PreviewStage'
import { ProjectRow } from '../Components/ProjectRow'

export default function HomeProjects() {
  const [selectedSlug, setSelectedSlug] = useState(homeProjects[0]?.slug)
  const [hoverSlug, setHoverSlug] = useState<string>()
  const selected = homeProjects.find((p) => p.slug === selectedSlug) ?? homeProjects[0]
  if (!selected) return null
  const shown = homeProjects.find((p) => p.slug === hoverSlug) ?? selected
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-12 min-[760px]:px-8 min-[760px]:py-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 id="projects-heading" className="m-0 text-[32px] font-bold min-[760px]:text-[44px]" style={{ letterSpacing: '-0.035em' }}>
          Projects
        </h2>
        <Button variant="secondary" to="/projects" trailingIcon="arrow" label="All projects" />
      </div>
      <div className="grid gap-4 min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-[900px]:items-start">
        <div
          role="group"
          aria-label="Projects"
          onPointerLeave={() => setHoverSlug(undefined)}
          className="surface-glass overflow-hidden rounded-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_26px_36px_-18px_rgba(8,14,50,0.4)]"
        >
          {homeProjects.map((p) => (
            <ProjectRow
              key={p.slug}
              project={p}
              selected={p.slug === selectedSlug}
              onSelect={() => setSelectedSlug(p.slug)}
              onPreview={(e) => {
                if (e.pointerType === 'mouse') setHoverSlug(p.slug)
              }}
            />
          ))}
        </div>
        <PreviewStage project={shown} selectedName={selected.name} />
      </div>
    </div>
  )
}
