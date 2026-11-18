import { techLogo } from '../content/techLogos'
import { Icon } from './Icon'

const chipClass =
  'inline-flex items-center gap-1.5 min-h-[26px] px-[9px] border border-[color-mix(in_srgb,var(--text)_40%,transparent)] rounded-md text-[13px] font-medium text-[var(--text)] box-border max-w-full'

export function StackChip({ name }: { name: string }) {
  const logo = techLogo(name)
  return (
    <span className={chipClass} title={name}>
      {logo.kind === 'logo' ? (
        <img src={logo.src} alt="" width={16} height={16} data-icon="logo" className="block w-4 h-4 shrink-0" />
      ) : (
        <Icon name={logo.kind} size={16} data-icon={logo.kind} />
      )}
      <span className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{name}</span>
    </span>
  )
}

export function MoreChip({ rest }: { rest: string[] }) {
  const list = rest.join(', ')
  return (
    <span className={chipClass} title={list} aria-label={`${rest.length} more: ${list}`}>
      +{rest.length} more
    </span>
  )
}
