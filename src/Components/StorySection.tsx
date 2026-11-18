import type { ReactNode } from 'react'

const body =
  'flex min-w-0 flex-col gap-3.5 text-[16px] leading-7 text-[var(--text)] [&_p]:m-0 [&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:m-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_li+li]:mt-1.5 [&_a]:underline [&_a]:underline-offset-[3px] [&_code]:font-mono [&_code]:text-[0.92em] [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md'

export function StorySection({ title, html, children }: { title: string; html?: string; children?: ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-3 min-[1100px]:grid-cols-[150px_minmax(0,1fr)] min-[1100px]:gap-x-9">
      <h2 className="m-0 text-[24px] font-bold leading-7 tracking-[-0.02em] text-[var(--text)]">{title}</h2>
      <div className={body}>
        {html !== undefined && <div className="flex flex-col gap-3.5" dangerouslySetInnerHTML={{ __html: html }} />}
        {children}
      </div>
    </section>
  )
}
