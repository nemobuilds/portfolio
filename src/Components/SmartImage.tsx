import { useState } from 'react'
import { ImageFallback } from './ImageFallback'

export function SmartImage({
  src,
  alt,
  initial,
  aspect,
}: {
  src?: string
  alt: string
  initial?: string
  aspect: string
}) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const showFallback = !src || state === 'error'
  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: aspect }}>
      {showFallback ? (
        <ImageFallback initial={initial} failed={!!src} />
      ) : (
        <>
          {state === 'loading' && <div className="absolute inset-0 bg-[var(--placeholder-fill)]" />}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setState('loaded')}
            onError={() => setState('error')}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </>
      )}
    </div>
  )
}
