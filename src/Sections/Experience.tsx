import { experience, leadLabel } from '../content/experience'
import { tools } from '../content/tools'
import { techLogo } from '../content/techLogos'
import { LeadEntryCard } from '../Components/LeadEntryCard'
import { LogRow } from '../Components/LogRow'
import { ToolTile } from '../Components/ToolTile'

const headingClass = 'm-0 text-[32px] font-bold text-[var(--cream)] min-[760px]:text-[44px]'
const headingStyle = { letterSpacing: '-0.035em' }

export default function Experience() {
  const lead = experience.find((e) => e.start)
  const rows = experience.filter((e) => e !== lead)
  const label = lead ? leadLabel(lead, new Date()) : 'Now,'
  const crafts = tools
    .map((t) => ({ ...t, items: t.items.filter((n) => techLogo(n).kind === 'logo') }))
    .filter((t) => t.items.length > 0)

  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-x-14 gap-y-8 px-4 py-12 min-[760px]:px-8 min-[760px]:py-16 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] min-[900px]:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        <h2 className={headingClass} style={headingStyle}>
          Experience
        </h2>
        {lead && <LeadEntryCard entry={lead} label={label} />}
        <ul
          aria-label="Earlier roles"
          className="m-0 list-none rounded-[10px] px-5 py-1 bg-[var(--glass-dark)] shadow-[inset_0_0_0_1px_rgba(200,212,250,0.36)]"
        >
          {rows.map((e) => (
            <LogRow key={`${e.period}-${e.role}`} entry={e} />
          ))}
        </ul>
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <h2 className={headingClass} style={headingStyle}>
          Tech stack
        </h2>
        <div className="flex flex-col">
          {crafts.map((c) => (
            <section
              key={c.craft}
              aria-label={c.craft}
              className="grid gap-2 border-t border-[rgba(200,210,245,0.16)] py-3 first:border-t-0 min-[900px]:grid-cols-[132px_minmax(0,1fr)] min-[900px]:gap-5"
            >
              <h3 className="m-0 text-[15px] font-bold text-[var(--cream)] min-[900px]:pt-[10px]" style={{ letterSpacing: '-0.015em' }}>
                {c.craft}
              </h3>
              <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-3 p-0">
                {c.items.map((n) => (
                  <ToolTile key={n} name={n} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
