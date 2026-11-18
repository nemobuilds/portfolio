import { SmartImage } from './SmartImage'

const cols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 min-[760px]:grid-cols-2',
  3: 'grid-cols-1 min-[760px]:grid-cols-2 min-[1100px]:grid-cols-3',
} as const

export function Gallery({ items }: { items: { src: string; caption: string }[] }) {
  if (items.length === 0) return null
  const n = (items.length >= 3 ? 3 : items.length) as 1 | 2 | 3
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pt-[72px]" aria-label="Gallery">
      <div data-columns={n} className={`grid gap-6 ${cols[n]}`}>
        {items.map((it) => (
          <figure
            key={it.src}
            className="surface-slate m-0 flex flex-col gap-3 rounded-[10px] px-2.5 pt-2.5 pb-3.5 shadow-[0_26px_36px_-18px_rgba(8,14,50,0.45)]"
          >
            <div className="overflow-hidden rounded-md">
              <SmartImage src={it.src} alt={it.caption} aspect="4/3" />
            </div>
            <figcaption className="px-1 text-[14px] text-[var(--text-secondary)]">{it.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
