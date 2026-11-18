import type { MouseEventHandler } from 'react'
import { Link } from 'react-router-dom'

export type PhoneSectionItem = {
  label: string
  to: string
  /** Extra words for screen readers, read after the visible label (WCAG 2.5.3). */
  srText?: string
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
      {items.map((item) => {
        const text = (
          <>
            {item.label}
            {item.srText && <span className="sr-only">{item.srText}</span>}
          </>
        )
        return item.to.startsWith('#') ? (
          <a key={item.label} href={item.to} onClick={item.onClick} className={itemClass}>
            {text}
          </a>
        ) : (
          <Link key={item.label} to={item.to} onClick={item.onClick} className={itemClass}>
            {text}
          </Link>
        )
      })}
    </nav>
  )
}
