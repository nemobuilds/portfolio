const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatMonth(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-')
  return `${MONTHS[Number(month) - 1]} ${year}`
}
