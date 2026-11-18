import { Button } from './Button'
import { Icon } from './Icon'

type Props = {
  repoUrl?: string
  liveUrl?: string
  isPrivate?: boolean
  extras?: { label: string; url: string }[]
  size?: 'md' | 'sm'
}

export function ProjectLinks({ repoUrl, liveUrl, isPrivate, extras = [], size = 'md' }: Props) {
  const showPrivate = !!isPrivate && !repoUrl
  if (!repoUrl && !liveUrl && !showPrivate && extras.length === 0) return null
  return (
    <nav
      aria-label="Project links"
      className={`flex flex-wrap items-center ${size === 'sm' ? 'gap-2' : 'gap-2.5'}`}
    >
      {extras.map((x) => (
        <Button key={x.url} variant="secondary" href={x.url} external label={x.label} />
      ))}
      {repoUrl && <Button variant="secondary" href={repoUrl} external leadingIcon="github" label="GitHub" />}
      {showPrivate && (
        <span className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-[var(--text-secondary)]">
          <Icon name="lock" size={16} />
          <span>Code is private</span>
        </span>
      )}
      {liveUrl && <Button variant="primary" href={liveUrl} external label="Live demo" />}
    </nav>
  )
}
