import type { PointerEvent } from 'react'
import type { Project } from '../content/projects'
import { Icon } from './Icon'
import { SmartImage } from './SmartImage'

type Props = {
  project: Project
  selected: boolean
  onSelect: () => void
  onPreview?: (event: PointerEvent<HTMLButtonElement>) => void
}

export function ProjectRow({ project, selected, onSelect, onPreview }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      onPointerEnter={onPreview}
      className={`grid min-h-14 w-full cursor-pointer grid-cols-[56px_minmax(0,1fr)_16px] items-center gap-3 border-0 border-t border-[rgba(23,22,28,0.12)] px-3 py-2 text-left text-[#17161C] transition-colors duration-250 ease-in-out first:border-t-0 motion-reduce:transition-none ${
        selected ? 'bg-[rgba(255,255,255,0.75)]' : 'bg-transparent hover:bg-[rgba(255,255,255,0.45)]'
      }`}
    >
      <span className="block h-9 w-14 overflow-hidden rounded-[4px] shadow-[inset_0_0_0_1px_rgba(23,22,28,0.12)]">
        <SmartImage src={project.thumbnail} alt="" initial={project.name.charAt(0)} aspect="56/36" crop="top" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[15px] font-bold">{project.name}</span>
        <span className="truncate text-[12px] text-[#3A4058]">{project.stack.join(' · ')}</span>
      </span>
      {selected ? (
        <span aria-hidden="true" className="size-2.5 rounded-full bg-[#FF8237] shadow-[0_0_0_3px_rgba(255,130,55,0.25)]" />
      ) : (
        <span aria-hidden="true" className="flex text-[#3A4058]"><Icon name="arrow" size={14} /></span>
      )}
    </button>
  )
}
