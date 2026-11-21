import { Link } from 'react-router-dom'
import { Avatar } from '../Components/Avatar'
import { Button } from '../Components/Button'

// Hero B: the greeting is the title and the paragraph is the main text. The title
// stays modest (28px on phones, up to 40px) so it never outweighs the paragraph.
export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="flex justify-center px-4 pt-[112px] pb-[48px] text-center min-[760px]:px-8 min-[760px]:pt-[128px] min-[760px]:pb-[56px]"
    >
      <div className="flex min-w-0 flex-col items-center gap-6">
        <h1
          id="hero-heading"
          className="m-0 inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[clamp(28px,3.2vw,40px)] font-bold text-[var(--text)]"
          style={{ lineHeight: 1.1, letterSpacing: '-0.035em' }}
        >
          <span>Hi, I’m John Rogee</span>
          <span className="min-[760px]:hidden"><Avatar size={36} /></span>
          <span className="hidden min-[760px]:inline-flex"><Avatar size={44} /></span>
          <em className="font-serif font-normal text-[1em] text-[var(--serif-accent)]" style={{ letterSpacing: '-0.01em' }}>
            aka Nemo
          </em>
        </h1>
        <div className="flex max-w-[60ch] flex-col gap-3">
          <p className="m-0 text-[18px] leading-normal text-[var(--text)] min-[760px]:text-[21px]">
            Engineer from Manila. I build backend APIs and full-stack apps, then push them until they break, so the
            next version doesn’t.
          </p>
          <p className="m-0 text-[16px] leading-normal text-[var(--text-secondary)] min-[760px]:text-[18px]">
            Lately I’ve been building{' '}
            <Link
              to="/projects/endpoint"
              className="font-semibold text-[var(--text)] underline decoration-[var(--accent)] decoration-2 underline-offset-[3px]"
            >
              Endpoint
            </Link>
            , an API health monitor that runs scheduled uptime and response-time checks.
          </p>
        </div>
        <div className="flex flex-nowrap items-center justify-center gap-3">
          <Button variant="primary" surface="ink" href="#projects" trailingIcon="arrow" label="See the work" />
          <Button variant="secondary" href="#contact" label="Get in touch" />
        </div>
      </div>
    </section>
  )
}
