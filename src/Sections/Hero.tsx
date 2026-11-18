import { Avatar } from '../Components/Avatar'
import { Button } from '../Components/Button'

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="flex justify-center px-4 pt-[112px] pb-[48px] text-center min-[760px]:px-8 min-[760px]:pt-[128px] min-[760px]:pb-[56px]"
    >
      <div className="flex min-w-0 flex-col items-center gap-7">
        <p className="m-0 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[18px] text-[var(--text-secondary)]">
          <span>Hi, I’m John Rogee</span>
          <Avatar size={36} />
          <span className="-ml-1.5">,</span>
          <em className="font-serif text-[18px] text-[var(--serif-accent)]">aka Nemo</em>
        </p>
        <h1
          id="hero-heading"
          className="m-0 font-bold"
          style={{ fontSize: 'clamp(26px, min(7vw, max(4.4vw, 40px)), 64px)', lineHeight: 1.04, letterSpacing: '-0.04em' }}
        >
          <span className="block">I build software with care,{' '}</span>
          <span className="block">push it until it bends,{' '}</span>
          <span className="block">
            and make it <span className="accent-word">stronger</span>.
          </span>
        </h1>
        <p className="m-0 max-w-[48ch] text-[18px] text-[var(--text-secondary)]">
          Building software, and learning how to keep it fast and up.
        </p>
        <div className="flex flex-nowrap items-center justify-center gap-3">
          <Button variant="primary" surface="ink" href="#projects" trailingIcon="arrow" label="See the work" />
          <Button variant="secondary" href="#contact" label="Get in touch" />
        </div>
      </div>
    </section>
  )
}
