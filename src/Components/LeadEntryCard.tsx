import type { LogEntry } from '../content/experience'

export function LeadEntryCard({ entry, label }: { entry: LogEntry; label: 'Next,' | 'Now,' }) {
  return (
    <article className="surface-glass--deep relative flex flex-col gap-1.5 rounded-[10px] px-7 py-6 shadow-[inset_0_0_0_1px_rgba(200,212,250,0.36),0_26px_36px_-18px_rgba(0,0,0,0.9)]">
      <h3 className="m-0 text-[26px] font-bold" style={{ letterSpacing: '-0.02em' }}>
        <span className="font-serif text-[26px] font-normal italic text-[var(--accent)]">{label}</span>{' '}
        {entry.role}
      </h3>
      {entry.focus && <p className="m-0 text-base font-bold text-[var(--ember)]">{entry.focus}</p>}
      <p className="m-0 text-sm font-medium text-[#D2DBF8]">
        {entry.org} · {entry.period}
      </p>
      {entry.description && <p className="m-0 mt-1.5 text-[15px] leading-normal text-[#D2DBF8]">{entry.description}</p>}
    </article>
  )
}
