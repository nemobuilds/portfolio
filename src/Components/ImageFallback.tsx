export function ImageFallback({
  initial,
  failed,
  label = 'Image unavailable',
}: {
  initial?: string
  failed?: boolean
  label?: string
}) {
  return (
    <div className="w-full h-full min-h-full flex items-center justify-center bg-[#C9D0DC] text-[#3A4058]">
      {failed || !initial ? (
        <span className="text-[13px]">{label}</span>
      ) : (
        <span className="italic text-[48px] leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
          {initial}
        </span>
      )}
    </div>
  )
}
