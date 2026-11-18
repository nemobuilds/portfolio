import type { MouseEventHandler, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

type Props = {
  variant: 'primary' | 'secondary' | 'text' | 'icon'
  surface?: 'glass' | 'ink'
  href?: string
  to?: string
  onClick?: MouseEventHandler<HTMLElement>
  external?: boolean
  download?: boolean
  leadingIcon?: IconName
  trailingIcon?: 'arrow' | 'external' | 'download'
  disabled?: boolean
  label: string
  children?: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 min-h-11 rounded-[7px] font-bold text-[14px] no-underline whitespace-nowrap box-border cursor-pointer transition-[background-color,color,border-color,transform] duration-250 ease-in-out active:translate-y-px motion-reduce:transition-none'

function palette(variant: Props['variant'], surface: Props['surface']): string {
  if (surface === 'ink') {
    return 'bg-[#17161C] text-[#F4EEE3] border border-[rgba(244,238,227,0.2)] hover:bg-[#2B2A33]'
  }
  if (variant === 'primary') {
    return 'bg-[#F06A16] text-[#17161C] border border-[rgba(23,22,28,0.12)] hover:bg-[#FF8133] active:bg-[#D85A0C]'
  }
  if (surface === 'glass') {
    if (variant === 'text') return 'bg-transparent text-[#EFECE3] border border-transparent hover:underline'
    return 'bg-transparent text-[#EFECE3] border border-[rgba(239,236,227,0.6)] hover:bg-[rgba(239,236,227,0.12)]'
  }
  if (variant === 'text') return 'bg-transparent text-[var(--text)] border border-transparent hover:underline'
  return 'bg-transparent text-[var(--text)] border border-[color-mix(in_srgb,var(--text)_55%,transparent)] hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)]'
}

export function Button({
  variant, surface, href, to, onClick, external, download, leadingIcon, trailingIcon, disabled, label, children,
}: Props) {
  const isIcon = variant === 'icon'
  const trailing: IconName | undefined = external ? 'external' : download ? 'download' : trailingIcon
  const cls = [
    base,
    palette(variant, surface),
    isIcon ? 'w-11 p-0' : variant === 'text' ? 'px-2' : 'px-4',
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
  ].join(' ')

  const content = isIcon ? (
    <Icon name={leadingIcon ?? 'arrow'} />
  ) : (
    <>
      {leadingIcon && <Icon name={leadingIcon} size={16} />}
      <span>{children ?? label}</span>
      {trailing && <Icon name={trailing} size={16} />}
    </>
  )
  const aria = isIcon ? { 'aria-label': label } : {}

  if (to && !disabled) {
    return <Link to={to} className={cls} onClick={onClick} {...aria}>{content}</Link>
  }
  if (href && !disabled) {
    return (
      <a
        href={href}
        className={cls}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        {...(download ? { download: '' } : {})}
        {...aria}
      >
        {content}
      </a>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} {...aria}>
      {content}
    </button>
  )
}
