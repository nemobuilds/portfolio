import { Button } from '../Components/Button'
import { Icon, type IconName } from '../Components/Icon'
import { site } from '../content/site'

const socials: { label: string; href: string; icon: IconName }[] = [
  { label: 'GitHub', href: site.social.github, icon: 'github' },
  { label: 'LinkedIn', href: site.social.linkedin, icon: 'linkedin' },
  { label: 'Instagram', href: site.social.instagram, icon: 'instagram' },
]

export default function Contact() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 px-4 pb-6 pt-10 text-center text-[var(--cream)] min-[760px]:px-8 min-[760px]:pt-16">
      <h2 id="contact-heading" className="m-0 font-bold leading-none" style={{ fontSize: 'clamp(44px, 6.6vw, 88px)', letterSpacing: '-0.04em' }}>
        Say <span className="accent-word !text-[#C8D2F5]">hello.</span>
      </h2>
      <p className="m-0 max-w-[500px] text-[18px] leading-[1.55] text-[#B9C3E8]">
        Have something that needs building, and needs to look good doing it? Let’s talk.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="select-all">
          <Button variant="primary" href={`mailto:${site.email}`} leadingIcon="mail" label={site.email} />
        </span>
        <Button variant="secondary" surface="glass" href={site.resumePath} download label="Résumé (PDF)" />
      </div>
      <nav aria-label="Social" className="-mt-2 flex flex-wrap justify-center gap-x-5">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 px-1.5 text-[15px] font-semibold text-[var(--cream)] no-underline hover:underline"
          >
            <Icon name={s.icon} size={16} />
            {s.label}
            <Icon name="external" size={15} />
          </a>
        ))}
      </nav>
    </div>
  )
}
