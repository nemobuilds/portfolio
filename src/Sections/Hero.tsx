import { Link } from 'react-router-dom'
import { Avatar } from '../Components/Avatar'
import { Button } from '../Components/Button'

// Hero v2, option C: left-aligned. The greeting is a small opener line, the first
// sentence is the big heading, the Endpoint sentence is small and muted.
//
// Layout: a two-column grid from 900px. The text sits in the left column; the
// right column (data-slot="hero-right") is an empty slot on purpose, so a card,
// image or demo can go there later without changing the layout. On phones it is
// a single column and the empty slot takes no space.
export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="pt-[112px] pb-[48px] min-[760px]:pt-[136px] min-[760px]:pb-[64px]"
    >
      {/* Same container as the other home sections (max 1200px, side padding inside it), so the hero
          text lines up with the Projects and Experience headings. */}
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 min-[760px]:px-8 min-[900px]:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] min-[900px]:items-center">
        <div className="flex min-w-0 max-w-[720px] flex-col items-start gap-5">
          <p className="m-0 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[16px] text-[var(--text-secondary)] min-[760px]:text-[17px]">
            <span>Hi, I’m John Rogee</span>
            <span className="min-[760px]:hidden"><Avatar size={28} /></span>
            <span className="hidden min-[760px]:inline-flex"><Avatar size={32} /></span>
            <em className="font-serif text-[1em] text-[var(--serif-accent)]">aka Nemo</em>
          </p>
          <h1
            id="hero-heading"
            className="m-0 text-[clamp(26px,3vw,36px)] font-bold text-[var(--text)]"
            style={{ lineHeight: 1.2, letterSpacing: '-0.03em' }}
          >
            Software Engineer from Manila. I build backend APIs and full-stack apps, then push them until they break, so the next
            version doesn’t.
          </h1>
          <p className="m-0 max-w-[60ch] text-[15px] leading-relaxed text-[var(--text-secondary)]">
            Lately I’ve been building{' '}
            <Link
              to="/projects/endpoint"
              className="font-semibold text-[var(--text)] underline decoration-[var(--accent)] decoration-2 underline-offset-[3px]"
            >
              Endpoint
            </Link>
            , an API health monitor that runs scheduled uptime and response-time checks.
          </p>
          <div className="flex flex-nowrap items-center gap-3 pt-1">
            <Button variant="primary" surface="ink" href="#projects" trailingIcon="arrow" label="See the work" />
            <Button variant="secondary" href="#contact" label="Get in touch" />
          </div>
        </div>
        {/* Empty right slot: put future hero content here (see docs/content-guide.md, "Home page hero"). */}
        <div data-slot="hero-right" aria-hidden="true" className="hidden min-[900px]:block" />
      </div>
    </section>
  )
}
