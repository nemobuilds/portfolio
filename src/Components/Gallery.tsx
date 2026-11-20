import { Icon } from './Icon'
import { SmartImage } from './SmartImage'

// Standalone (full page width): one image fills the row; two or more go two to a row, one on phones.
const pageCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 min-[760px]:grid-cols-2',
} as const

// In the project page's main column (beside the facts rail from 900px): the column
// is only ~500-700px wide between 900px and 1100px, so one per row there, two above.
const columnCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 min-[760px]:grid-cols-2 min-[900px]:grid-cols-1 min-[1100px]:grid-cols-2',
} as const

/**
 * Each shot sits in a 16:9 frame cropped from the top by CSS only. The file is
 * never cut: the frame is a link that opens the full original in a new tab.
 */
export function Gallery({
  items,
  placement = 'page',
}: {
  items: { src: string; caption: string }[]
  /** "column": sits inside the project page's main column, under the case study. */
  placement?: 'page' | 'column'
}) {
  if (items.length === 0) return null
  const n = (items.length >= 2 ? 2 : 1) as 1 | 2
  const cols = placement === 'column' ? columnCols[n] : pageCols[n]
  const wrap = placement === 'column' ? '' : 'mx-auto w-full max-w-[1200px] px-6 pt-[72px]'
  return (
    <section className={wrap} aria-label="Gallery" data-placement={placement}>
      <div data-columns={n} className={`grid gap-7 ${cols}`}>
        {items.map((it) => (
          <figure
            key={it.src}
            className="surface-slate m-0 flex flex-col gap-3 rounded-[10px] px-2.5 pt-2.5 pb-3.5 shadow-[0_26px_36px_-18px_rgba(8,14,50,0.45)]"
          >
            <a
              href={it.src}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open full image: ${it.caption}`}
              className="group relative block overflow-hidden rounded-md"
            >
              <SmartImage src={it.src} alt={it.caption} aspect="16/9" crop="top" />
              <span
                aria-hidden="true"
                className="absolute right-2.5 bottom-2.5 inline-flex size-9 items-center justify-center rounded-full bg-[rgba(23,22,28,0.72)] text-[#F4EEE3] opacity-0 transition-opacity duration-250 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
              >
                <Icon name="external" size={16} />
              </span>
            </a>
            <figcaption className="px-1 text-[15px] text-[var(--text-secondary)]">{it.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
