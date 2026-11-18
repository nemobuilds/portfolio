import { Button } from './Button'

export function EmptyState({ message, action }: { message: string; action?: { label: string; onClick(): void } }) {
  return (
    <div className="flex flex-col items-start gap-3 px-6 py-7">
      <p className="m-0 text-[15px] text-[var(--text-secondary)]">{message}</p>
      {action && <Button variant="secondary" label={action.label} onClick={action.onClick} />}
    </div>
  )
}
