import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

// Rounded-full tags for category names. Stack chips (StackChip) keep square
// corners and logos, so the two never look alike.
// filled = what it is about (project Focus, certification Topic)
// outline = where it comes from or what kind it is (Origin, Domain, Type)
const base =
  'inline-flex items-center box-border rounded-full border text-[13px] font-semibold leading-none whitespace-nowrap text-[var(--text)]'
const look = {
  filled: 'border-transparent bg-[color-mix(in_srgb,var(--text)_10%,transparent)]',
  outline: 'bg-transparent border-[color-mix(in_srgb,var(--text)_40%,transparent)]',
}

type Props = {
  label: string
  variant?: keyof typeof look
  /** Makes the pill a link, 32px tall for touch, e.g. to the filtered list. */
  to?: string
  replace?: boolean
}

export function CategoryPill({ label, variant = 'filled', to, replace }: Props) {
  if (to) {
    return (
      <Link
        to={to}
        replace={replace}
        className={`${base} ${look[variant]} min-h-8 px-3 no-underline transition-[border-color] duration-250 ease-in-out hover:border-[var(--text)] motion-reduce:transition-none`}
      >
        {label}
      </Link>
    )
  }
  return <span className={`${base} ${look[variant]} min-h-[26px] px-2.5`}>{label}</span>
}

export function CategoryPills({ children, label }: { children: ReactNode; label: string }) {
  return (
    <ul aria-label={label} className="m-0 flex list-none flex-wrap gap-2 p-0 [&>li]:flex">
      {children}
    </ul>
  )
}
