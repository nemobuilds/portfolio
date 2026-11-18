import type { MouseEventHandler } from 'react'
import { Link } from 'react-router-dom'

export type PhoneSectionItem = {
  label: string
  to: string
  ariaLabel?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

const itemClass =
  'flex min-h-11 flex-1 items-center justify-center text-[14px] font-semibold no-underline text-[#F4EEE3] last:text-[#F06A16]'

export function PhoneSectionBar({ items }: { items: PhoneSectionItem[] }) {
  return (
    <nav
      aria-label="Page sections"
      className="fixed inset-x-0 bottom-0 z-40 flex bg-[#17161C] px-2 pb-[env(safe-area-inset-bottom)] min-[760px]:hidden"
    >
      {items.map((item) =>
        item.to.startsWith('#') ? (
          <a key={item.label} href={item.to} aria-label={item.ariaLabel} onClick={item.onClick} className={itemClass}>
            {item.label}
          </a>
        ) : (
          <Link key={item.label} to={item.to} aria-label={item.ariaLabel} onClick={item.onClick} className={itemClass}>
            {item.label}
          </Link>
        ),
      )}
    </nav>
  )
}
