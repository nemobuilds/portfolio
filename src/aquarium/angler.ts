export type AnglerState = {
  phase: 'hidden' | 'rising' | 'holding' | 'sinking'
  timer: number
  side: 'left' | 'right'
}

const FIRST_RISE = 2
const RISE = 1.8
const HOLD = 5
const SINK = 1.6

/** Hidden, waiting 2 s for its first rise. The wait only counts down while deep. */
export const initialAngler = (): AnglerState => ({ phase: 'hidden', timer: FIRST_RISE, side: 'left' })

export function stepAngler(s: AnglerState, dt: number, isDeep: boolean, rng: () => number): AnglerState {
  switch (s.phase) {
    case 'hidden': {
      if (!isDeep) return s
      const timer = s.timer - dt
      if (timer > 0) return { ...s, timer }
      return { phase: 'rising', timer: 0, side: rng() < 0.5 ? 'left' : 'right' }
    }
    case 'rising': {
      const timer = s.timer + dt
      return timer >= RISE ? { ...s, phase: 'holding', timer: 0 } : { ...s, timer }
    }
    case 'holding': {
      const timer = s.timer + dt
      return timer >= HOLD || !isDeep ? { ...s, phase: 'sinking', timer: 0 } : { ...s, timer }
    }
    case 'sinking': {
      const timer = s.timer + dt
      return timer >= SINK ? { ...s, phase: 'hidden', timer: 3 + rng() * 3 } : { ...s, timer }
    }
  }
}
