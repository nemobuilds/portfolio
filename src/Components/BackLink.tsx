import { Link } from 'react-router-dom'
import { Icon } from './Icon'

export function BackLink() {
  return (
    <Link
      to="/projects"
      className="pointer-events-auto inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-[var(--text-secondary)] no-underline hover:underline"
    >
      <Icon name="arrow-left" size={16} />
      <span>All projects</span>
    </Link>
  )
}
