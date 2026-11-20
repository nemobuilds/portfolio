import { useState } from 'react'
import { ImageFallback } from './ImageFallback'

export function SmartImage({
  src,
  alt,
  initial,
  aspect,
  crop = 'center',
}: {
  src?: string
  alt: string
  initial?: string
  aspect: string
  /**
   * Which part survives when the frame crops the image. Project screenshots use
   * "top" so the app's own navbar stays visible. The file itself is never cut.
   */
  crop?: 'top' | 'center'
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
            data-crop={crop}
            className={`absolute inset-0 w-full h-full object-cover ${crop === 'top' ? 'object-top' : 'object-center'}`}
          />
        </>
      )}
    </div>
  )
}
