import type { LogEntry } from '../content/experience'

/**
 * A current role in its own light slate card, above the earlier roles on dark glass.
 * On the home page `surface-slate` is always the light slate. "Now," uses the --date
 * burnt orange, which reads on the light card (the brand orange is too faint there).
 */
export function CurrentRoleCard({ entry }: { entry: LogEntry }) {
  return (
    <article className="surface-slate relative flex flex-col gap-1.5 rounded-[10px] px-7 py-6 shadow-[0_26px_36px_-18px_rgba(0,0,0,0.9)]">
      {/* Small decorative ring, like the old "Next" card had, so the card does not look flat. */}
      <span
        aria-hidden="true"
        className="absolute top-3.5 right-3.5 size-[9px] rounded-full border-[1.5px] border-[rgba(23,22,28,0.45)] bg-[rgba(23,22,28,0.06)]"
      />
      <h3 className="m-0 text-[24px] font-bold text-[var(--text)]" style={{ letterSpacing: '-0.02em' }}>
        <span className="font-serif text-[24px] font-normal italic text-[var(--date)]">Now,</span> {entry.role}
      </h3>
      <p className="m-0 text-sm font-semibold text-[var(--text-secondary)]">
        {entry.org} · {entry.period}
      </p>
      {entry.description && <p className="m-0 mt-1.5 text-[15px] leading-normal text-[var(--text-secondary)]">{entry.description}</p>}
    </article>
  )
}
