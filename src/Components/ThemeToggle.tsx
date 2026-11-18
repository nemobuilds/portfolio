import { useRef, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { useTheme } from '../theme/ThemeProvider'
import { animateThemeSwitch } from '../theme/themeTransition'

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const target = theme === 'dark' ? 'light' : 'dark'
  const running = useRef(false)

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (running.current) return
    running.current = true
    const rect = e.currentTarget.getBoundingClientRect()
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    const release = () => {
      running.current = false
    }
    // a failed switch must not leave the toggle locked or raise an unhandled rejection
    animateThemeSwitch(origin, () => flushSync(toggleTheme)).then(release, release)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Switch to ${target} theme`}
      // Transparent on the pill, so the icon always uses the theme's text colour (the pale glass made the
      // cream sun invisible in dark mode).
      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--card-edge)] bg-transparent text-[var(--text)] transition-colors duration-250 hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)] motion-reduce:transition-none"
    >
      {target === 'light' ? (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg {...iconProps}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}
