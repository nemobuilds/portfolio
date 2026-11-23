import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { isFiltered, type FacetView, type FilterState } from '../filter/filter'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { EmptyState } from './EmptyState'
import { Icon } from './Icon'

const line = 'border-[color-mix(in_srgb,var(--text)_16%,transparent)]'
const hoverWash = 'hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)]'

export function SearchBox({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange(q: string): void
}) {
  const id = useId()
  return (
    <div className="relative w-full min-[760px]:w-[340px]">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
        <Icon name="search" />
      </span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="surface-slate box-border min-h-12 w-full rounded-[7px] pl-[42px] pr-11 text-[16px] text-[var(--text)] placeholder:text-[var(--text-secondary)] [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-0.5 top-1/2 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)]"
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  )
}

export function FilterGroups({ views, onToggle }: { views: FacetView[]; onToggle(name: string): void }) {
  return (
    <>
      {views.map((v) => (
        <fieldset key={v.key} className="m-0 flex min-w-0 flex-col border-0 p-0">
          <legend className="pb-1.5 text-[15px] font-bold text-[var(--text)]">{v.label}</legend>
          {v.options.map((o) => (
            <label
              key={o.label}
              className={`-mx-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-[15px] font-medium text-[var(--text)] ${hoverWash}`}
            >
              <input
                type="checkbox"
                checked={o.checked}
                onChange={() => onToggle(o.label)}
                className="m-0 size-[18px] shrink-0 cursor-pointer accent-[var(--text)]"
              />
              <span className="flex-1">{o.label}</span>
              <span className="text-[13px] text-[var(--text-secondary)]">{o.count}</span>
            </label>
          ))}
        </fieldset>
      ))}
    </>
  )
}

function FilterSheet({
  label,
  views,
  showLabel,
  onToggle,
  onClearAll,
  onClose,
}: {
  label: string
  views: FacetView[]
  showLabel: string
  onToggle(name: string): void
  onClearAll(): void
  onClose(): void
}) {
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descId = useId()
  const closeRef = useRef(onClose)
  useFocusTrap(panel, true)

  useEffect(() => {
    closeRef.current = onClose
  })

  // Runs once per open: a new onClose each render must not steal focus back to Close.
  useEffect(() => {
    closeButton.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div data-testid="filter-scrim" aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-[rgba(22,32,72,0.42)]" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="surface-slate dialog-in relative flex max-h-[85vh] w-full flex-col rounded-t-2xl border-b-0 text-[var(--text)] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.5)]"
      >
        <div className={`flex items-center justify-between border-b ${line} py-2 pl-5 pr-2`}>
          <h2 id={titleId} className="m-0 text-[20px] font-bold tracking-[-0.01em]">
            Filters
          </h2>
          <span id={descId} className="sr-only">
            {label}
          </span>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="inline-flex size-11 cursor-pointer items-center justify-center border-0 bg-transparent text-[var(--text)]"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          <FilterGroups views={views} onToggle={onToggle} />
        </div>
        <div className={`flex items-center gap-3 border-t ${line} px-5 pt-3 pb-6`}>
          <button
            type="button"
            onClick={onClearAll}
            className="min-h-12 cursor-pointer border-0 bg-transparent px-2 text-[15px] font-bold text-[var(--text)] underline underline-offset-[3px]"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 flex-1 cursor-pointer rounded-[7px] border border-[rgba(23,22,28,0.12)] bg-[#FF8237] text-[15px] font-bold text-[#17161C] hover:bg-[#FF9D63]"
          >
            {showLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

type LayoutProps = {
  /** Plural noun for counts and labels, e.g. "projects". */
  noun: string
  singular: string
  views: FacetView[]
  state: FilterState
  picked: string[]
  total: number
  shown: number
  onToggle(name: string): void
  onClearSearch(): void
  onClearAll(): void
  sort?: SortProps
  children: ReactNode
}

type SortProps = {
  options: readonly { key: string; label: string }[]
  value: string
  onChange(key: string): void
}

/** Native select, so phones open their own picker. Sits at the right end of the result line. */
export function SortSelect({ options, value, onChange }: SortProps) {
  const id = useId()
  return (
    <div className="ml-auto flex items-center gap-2">
      <label htmlFor={id} className="text-[14px] font-semibold text-[var(--text-secondary)]">
        Sort
      </label>
      <span className="relative inline-flex items-center">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="surface-slate min-h-11 cursor-pointer appearance-none rounded-[7px] py-0 pr-9 pl-3 text-[14px] font-semibold text-[var(--text)]"
        >
          {options.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 text-[var(--text)]">
          <Icon name="chevron-down" size={14} />
        </span>
      </span>
    </div>
  )
}

/** Option B: filter sidebar on wide screens, a Filters button + bottom sheet on phones. */
export function FilterLayout({ noun, singular, views, state, picked, total, shown, onToggle, onClearSearch, onClearAll, sort, children }: LayoutProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const filtersButton = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const filtered = isFiltered(state)
  const q = state.q.trim()

  useEffect(() => {
    if (wasOpen.current && !sheetOpen) filtersButton.current?.focus()
    wasOpen.current = sheetOpen
  }, [sheetOpen])

  const count = filtered ? `Showing ${shown} of ${total} ${noun}` : `${total} ${noun}`
  const showLabel = `Show ${shown} ${shown === 1 ? singular : noun}`
  const chip = `inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border ${line} bg-[color-mix(in_srgb,var(--text)_8%,transparent)] py-0 pr-2.5 pl-3.5 text-[14px] font-semibold text-[var(--text)] hover:border-[var(--text)]`

  return (
    <div className="flex flex-col gap-8 min-[900px]:flex-row min-[900px]:items-start">
      {views.length > 0 && (
        <aside aria-label={`Filter ${noun}`} className={`hidden w-[232px] shrink-0 flex-col gap-6 border-r ${line} pr-7 min-[900px]:flex`}>
          <FilterGroups views={views} onToggle={onToggle} />
        </aside>
      )}
      <section aria-label="Results" className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {views.length > 0 && (
            <button
              ref={filtersButton}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              onClick={() => setSheetOpen(true)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[7px] border border-[var(--text)] bg-[var(--text)] px-3.5 text-[14px] font-semibold text-[var(--text-inverse)] min-[900px]:hidden"
            >
              <Icon name="filter" size={16} />
              Filters
              {picked.length > 0 && <small className="text-[13px] font-medium opacity-80">{picked.length}</small>}
            </button>
          )}
          <p aria-live="polite" className="m-0 mr-2 text-[15px] font-semibold text-[var(--text)]">
            {count}
          </p>
          {q && (
            <button type="button" aria-label={`Remove search ${q}`} onClick={onClearSearch} className={chip}>
              “{q}”
              <Icon name="close" size={14} />
            </button>
          )}
          {picked.map((name) => (
            <button key={name} type="button" aria-label={`Remove filter ${name}`} onClick={() => onToggle(name)} className={chip}>
              {name}
              <Icon name="close" size={14} />
            </button>
          ))}
          {filtered && (
            <button
              type="button"
              onClick={onClearAll}
              className="min-h-11 cursor-pointer border-0 bg-transparent px-2 text-[14px] font-bold text-[var(--text)] underline underline-offset-[3px]"
            >
              Clear all
            </button>
          )}
          {sort && <SortSelect {...sort} />}
        </div>
        {shown === 0 ? (
          <EmptyState
            message={`No ${noun} match these filters.`}
            action={{ label: 'Clear search and filters', onClick: onClearAll }}
          />
        ) : (
          children
        )}
      </section>
      {sheetOpen && (
        <FilterSheet
          label={`Filter ${noun}`}
          views={views}
          showLabel={showLabel}
          onToggle={onToggle}
          onClearAll={onClearAll}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  )
}
