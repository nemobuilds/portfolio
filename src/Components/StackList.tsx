import { StackChip, MoreChip } from './StackChip'

export function StackList({ items, limit }: { items: string[]; limit?: number }) {
  const shown = limit !== undefined && items.length > limit ? items.slice(0, limit) : items
  const rest = items.slice(shown.length)
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((n) => <StackChip key={n} name={n} />)}
      {rest.length > 0 && <MoreChip rest={rest} />}
    </div>
  )
}
