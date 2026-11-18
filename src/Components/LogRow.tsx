import type { LogEntry } from '../content/experience'

export function LogRow({ entry }: { entry: LogEntry }) {
  return (
    <li className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 border-t border-[rgba(200,210,245,0.18)] py-3.5 first:border-t-0">
      <span className="text-[13px] font-bold text-[var(--ember)] [font-variant-numeric:tabular-nums]">{entry.period}</span>
      <div className="flex flex-col gap-0.5">
        <b className="text-base text-[var(--cream)]">{entry.role}</b>
        <span className="text-sm text-[#D2DBF8]">{entry.org}</span>
      </div>
    </li>
  )
}
