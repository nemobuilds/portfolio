import { techLogo } from '../content/techLogos'

export function ToolTile({ name }: { name: string }) {
  const logo = techLogo(name)
  if (logo.kind !== 'logo') return null
  return (
    <li className="app-cell flex w-[72px] flex-col items-center gap-[9px]">
      <span className="app-tile">
        <img src={logo.src} alt="" />
      </span>
      <span className="text-center text-[12.5px] font-semibold text-[var(--cream)]">{name}</span>
    </li>
  )
}
