import { useEffect, useRef, type ReactNode } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'

type Props = {
  open: boolean
  onClose: () => void
  titleId: string
  children: ReactNode
}

export function Dialog({ open, onClose, titleId, children }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useFocusTrap(panel, open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 min-[760px]:items-center min-[760px]:p-6">
      <div data-testid="dialog-scrim" className="fixed inset-0 bg-[rgba(22,32,72,0.42)]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="surface-slate dialog-in relative my-auto w-full max-w-[880px] rounded-xl p-5 text-[var(--text)] shadow-[0_26px_36px_-18px_rgba(8,14,50,0.45)] min-[760px]:p-7"
      >
        {children}
      </div>
    </div>
  )
}
