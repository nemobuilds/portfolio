import { techLogo } from '../content/techLogos'

export function ToolTile({ name }: { name: string }) {
  const logo = techLogo(name)
  if (logo.kind !== 'logo') return null
  return (
    <li className="app-cell flex w-[60px] flex-col items-center gap-1.5">
      <span className="app-tile">
        <img src={logo.src} alt="" />
      </span>
      <span className="text-center text-[11px] font-medium leading-tight text-[var(--cream)] opacity-90">{name}</span>
    </li>
  )
}
