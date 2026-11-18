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
    let active = true

    const finish = () => {
      if (!active) return
      active = false
      markBootSeen()
      onDoneRef.current()
    }
    const skip = () => {
      if (!active) return
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
