import type { KeyboardEvent } from 'react'

type Option = { label: string; count: number }

const base =
  'inline-flex shrink-0 items-center gap-2 min-h-11 px-3.5 rounded-[7px] border text-[14px] font-semibold cursor-pointer box-border transition-[background-color,color,border-color] duration-250 ease-in-out motion-reduce:transition-none'
const off = 'surface-slate hover:border-[var(--text)]'
const on = 'bg-[var(--text)] text-[var(--text-inverse)] border-[var(--text)]'

export function FilterButtons({
  options,
  selected,
  onSelect,
  label = 'Filter projects',
}: {
  options: Option[]
  selected: string
  onSelect(label: string): void
  label?: string
}) {
  const move = (e: KeyboardEvent<HTMLButtonElement>, from: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (from + step + options.length) % options.length
    onSelect(options[next].label)
    const radios = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    radios?.[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex gap-2 max-[759px]:overflow-x-auto max-[759px]:pb-1 min-[760px]:flex-wrap"
    >
      {options.map((o, i) => {
        const isOn = o.label === selected
        return (
          <button
            key={o.label}
            type="button"
            role="radio"
            aria-checked={isOn}
            tabIndex={isOn ? 0 : -1}
            onClick={() => onSelect(o.label)}
            onKeyDown={(e) => move(e, i)}
            className={`${base} ${isOn ? on : off}`}
          >
            {o.label}
            <small className={`text-[13px] font-medium ${isOn ? 'opacity-80' : 'text-[var(--text-secondary)]'}`}>{o.count}</small>
          </button>
        )
      })}
    </div>
  )
}
