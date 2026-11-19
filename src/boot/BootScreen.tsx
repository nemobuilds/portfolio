import { useLayoutEffect, useRef } from 'react'
import { BOOT_TIMING, bootTasks, markBootSeen, trackProgress } from './bootProgress'
import { createBootRenderer } from './bootRenderer'

const SKIP_EVENTS = ['keydown', 'pointerdown', 'touchstart'] as const

export function BootScreen({ onDone }: { onDone(): void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onDoneRef = useRef(onDone)
  useLayoutEffect(() => {
    onDoneRef.current = onDone
  })

  useLayoutEffect(() => {
    const canvas = canvasRef.current!
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = createBootRenderer(canvas, { reducedMotion })
    // The canvas has painted the dark screen, so the boot colour from index.html can go now.
    // Kept on, it would paint the page black under the wave instead of showing the home page.
    delete document.documentElement.dataset.boot
    let active = true

    const finish = () => {
      if (!active) return
      active = false
      markBootSeen()
      onDoneRef.current()
    }
    const skip = (e: Event) => {
      if (!active) return
      if (e.type !== 'keydown') {
        // The same gesture's click would land on whatever is under the overlay.
        const swallow = (ev: Event) => {
          ev.preventDefault()
          ev.stopPropagation()
        }
        window.addEventListener('click', swallow, true)
        setTimeout(() => window.removeEventListener('click', swallow, true), 500)
      }
      renderer.skip()
      finish()
    }

    trackProgress(bootTasks(), f => active && renderer.setProgress(f), BOOT_TIMING.capMs).then(() => {
      if (active) renderer.play(finish)
    })
    for (const e of SKIP_EVENTS) window.addEventListener(e, skip, { passive: true })

    return () => {
      active = false
      for (const e of SKIP_EVENTS) window.removeEventListener(e, skip)
      renderer.destroy()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[1000]" role="status" aria-label="Loading John Rogee Turqueza’s portfolio">
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </div>
  )
}
