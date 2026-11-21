export type LogEntry = {
  period: string
  role: string
  org: string
  start?: string // YYYY-MM
  focus?: string
  description?: string
  /** true keeps the entry in the data but leaves it off the site. Remove the line (or set false) to show it again. */
  hidden?: boolean
  /** true shows the role in its own light slate "Now," card above the earlier roles. */
  current?: boolean
}

export const experience: LogEntry[] = [
  {
    // Hidden until the owner wants to announce the new role. Remove `hidden` to show it as the lead card again.
    hidden: true,
    period: 'from December 2026',
    role: 'API Engineer',
    org: 'East West Banking Corporation',
    start: '2026-12',
    focus: 'Backend & site reliability · Azure',
    description: 'Building backend APIs on Azure and keeping them fast, observable and up.',
  },
  { current: true, period: '2025 – now', role: 'Software Test Engineer', org: 'East West Banking Corporation' },
  { period: '2025', role: 'Software QA Tester', org: 'East West Banking Corporation' },
  { period: '2024 – 2025', role: '4th-Year Representative', org: 'Junior Philippine Computer Society' },
  { period: '2021 – 2025', role: 'BS Computer Science', org: 'Our Lady of Fatima University' },
]

/** The entries the site shows: everything without `hidden: true`, in data order. */
export function visibleEntries(entries: readonly LogEntry[]): LogEntry[] {
  return entries.filter((e) => !e.hidden)
}

/**
 * Splits the visible entries for the Experience section:
 * - lead: the first entry with a `start` month that is not flagged current (the "Next," card),
 * - current: entries with `current: true` (light slate "Now," cards),
 * - rows: everything else, as compact rows.
 */
export function groupEntries(entries: readonly LogEntry[]) {
  const shown = visibleEntries(entries)
  const lead = shown.find((e) => e.start && !e.current)
  const current = shown.filter((e) => e.current)
  const rows = shown.filter((e) => e !== lead && !e.current)
  return { lead, current, rows }
}

export function leadLabel(entry: LogEntry, today: Date): 'Next,' | 'Now,' {
  if (!entry.start) return 'Now,'
  const [y, m] = entry.start.split('-').map(Number)
  return new Date(y, m - 1, 1) > today ? 'Next,' : 'Now,'
}
