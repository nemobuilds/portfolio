import type { ReactNode } from 'react'
import type { Project } from '../content/projects'
import { categoriesIn } from '../content/types'
import { Icon } from './Icon'
import { StackList } from './StackList'

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 py-[18px] first:pt-0 last:pb-0 [&+&]:border-t [&+&]:border-[color-mix(in_srgb,var(--text)_16%,transparent)]">
      <span className="text-[14px] font-semibold text-[var(--text-secondary)]">{label}</span>
      {children}
    </div>
  )
}

const linkCls =
  'inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-[var(--text)] underline underline-offset-[3px] break-all'
const shortUrl = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '')

export function FactsRail({ project }: { project: Project }) {
  const { categories, role, period, stack, repoUrl, liveUrl, isPrivate, extraLinks } = project
  const focus = categoriesIn('focus', categories)
  const origin = categoriesIn('origin', categories)
  const hasLinks = !!repoUrl || !!liveUrl || isPrivate || extraLinks.length > 0
  return (
    <aside
      aria-label="Project facts"
      className="surface-slate flex flex-col rounded-[10px] p-[26px] shadow-[0_26px_36px_-18px_rgba(8,14,50,0.45)] min-[900px]:sticky min-[900px]:top-6"
    >
      <Fact label="Type">
        <b className="text-[17px] font-semibold leading-snug">{(focus.length ? focus : categories).join(' · ')}</b>
        {origin.length > 0 && <span className="text-[15px] text-[var(--text-secondary)]">{origin.join(' · ')}</span>}
      </Fact>
      {role && (
        <Fact label="Role">
          <span className="text-[15px]">{role}</span>
        </Fact>
      )}
      {period && (
        <Fact label="Timeline">
          <span className="text-[15px]">{period}</span>
        </Fact>
      )}
      {stack.length > 0 && (
        <Fact label="Stack">
          <StackList items={stack} />
        </Fact>
      )}
      {hasLinks && (
        <Fact label="Links">
          <div className="flex flex-col">
            {extraLinks.map((x) => (
              <a key={x.url} href={x.url} target="_blank" rel="noreferrer" className={linkCls}>
                {x.label}
                <Icon name="external" size={14} />
              </a>
            ))}
            {repoUrl && (
              <a href={repoUrl} target="_blank" rel="noreferrer" className={linkCls}>
                {shortUrl(repoUrl)}
                <Icon name="external" size={14} />
              </a>
            )}
            {isPrivate && !repoUrl && (
              <span className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-[var(--text-secondary)]">
                <Icon name="lock" size={16} />
                Code is private
              </span>
            )}
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noreferrer" className={linkCls}>
                {shortUrl(liveUrl)}
                <Icon name="external" size={14} />
              </a>
            )}
          </div>
        </Fact>
      )}
    </aside>
  )
}
