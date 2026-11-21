import { useState } from 'react'
import { site } from '../content/site'

export function Avatar({ size, src = site.avatarPath, alt = '' }: { size: 28 | 32 | 36 | 44; src?: string; alt?: string }) {
  const [failed, setFailed] = useState(false)
  const frame = { width: size, height: size }
  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center rounded-full shrink-0 bg-[var(--avatar-fill)] text-[var(--avatar-ink)] font-bold ring-1 ring-inset ring-[var(--avatar-ring)]"
        style={{ ...frame, fontSize: size * 0.42 }}
      >
        JR
      </span>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="block rounded-full object-cover shrink-0 ring-1 ring-inset ring-[var(--avatar-ring)]"
      style={frame}
    />
  )
}
