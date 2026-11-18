import type { SVGProps } from 'react'

export type IconName =
  | 'arrow' | 'arrow-left' | 'external' | 'download' | 'github' | 'linkedin'
  | 'instagram' | 'sun' | 'moon' | 'menu' | 'close' | 'lock' | 'award'
  | 'chain' | 'code' | 'mail'

const paths: Record<IconName, string> = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
  external: 'M7 17L17 7M8 7h9v9',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  github:
    'M9 19c-4 1.5-4-2-6-2m12 4v-3.5a3 3 0 0 0-.8-2.3c2.8-.3 5.8-1.4 5.8-6.2a4.8 4.8 0 0 0-1.3-3.3 4.5 4.5 0 0 0-.1-3.3s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.500 2.600 5.400 2.900 5.400 2.900a4.500 4.500 0 0 0-.1 3.300A4.800 4.800 0 0 0 4 9.500c0 4.800 3 5.900 5.800 6.200A3 3 0 0 0 9 18v3',
  linkedin:
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  instagram:
    'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM16 11.4a4 4 0 1 1-7.9 1.2 4 4 0 0 1 7.9-1.2zM17.5 6.5h.01',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'M6 6l12 12M18 6L6 18',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  award: 'M12 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM8.2 13.9L7 22l5-3 5 3-1.2-8.1',
  chain:
    'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  mail: 'M3 5h18v14H3zM3 7l9 7 9-7',
}

type Props = { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, 'name'>

export function Icon({ name, size = 18, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flex: '0 0 auto' }}
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  )
}
