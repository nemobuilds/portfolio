import { Link } from 'react-router-dom'
import type { Certificate } from '../content/certifications'
import { certCategoriesIn, verifyLabel } from '../content/certifications'
import { formatMonth } from '../content/dates'
import { Button } from './Button'
import { CategoryPill, CategoryPills } from './CategoryPill'
import { Icon } from './Icon'
import { SmartImage } from './SmartImage'

export function CertificateScan({ certificate }: { certificate: Certificate }) {
  if (certificate.scan) {
    return (
      <div className="overflow-hidden rounded-md bg-[var(--scan)]">
        <SmartImage src={certificate.scan} alt={`Scan of ${certificate.name}`} aspect="4/3" />
      </div>
    )
  }
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-3 rounded-md bg-[var(--scan)] px-6 text-center text-[#3A4058]"
      style={{ aspectRatio: '4/3' }}
    >
      <Icon name="award" size={36} />
      <span className="text-[15px] font-semibold leading-snug">{certificate.issuer}</span>
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function issuerLine(c: Certificate): string {
  return c.via ? `${c.issuer}, via ${c.via}` : c.issuer
}

/** Home: the card sits on deep water, so it is dark glass with a dark scan panel (board HomeDesktop, Certifications). */
function HomeCertificateCard({ certificate }: { certificate: Certificate }) {
  const issuer = certificate.via ? `${certificate.issuer} · ${certificate.via}` : certificate.issuer
  return (
    <article className="surface-glass--deep relative flex h-full flex-col gap-3 rounded-[10px] p-2.5 pb-4 shadow-[inset_0_0_0_1px_rgba(200,212,250,0.36),0_26px_36px_-18px_rgba(0,0,0,0.9)]">
      <div className="overflow-hidden rounded-md bg-[#1B1D24]" style={{ aspectRatio: '16/9' }}>
        {certificate.scan ? (
          <SmartImage src={certificate.scan} alt={`Scan of ${certificate.name}`} aspect="16/9" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-[#C3C7D2]">
            <Icon name="award" size={30} />
            <span className="text-[14px] font-semibold">{certificate.issuer}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1.5">
        <h3 className="m-0 text-[16px] font-bold leading-[1.25] tracking-[-0.01em]">
          <Link
            to={`/certificates/${certificate.id}`}
            state={{ fromList: true }}
            data-cert-id={certificate.id}
            className="text-[var(--cream)] no-underline after:absolute after:inset-0 after:content-['']"
          >
            {certificate.name}
          </Link>
        </h3>
        <p className="m-0 text-[14px] leading-[1.4] text-[#C8D2F5]">{issuer}</p>
        {certificate.issued && (
          <p className="m-0 text-[14px] font-bold text-[var(--ember)]">{formatMonth(certificate.issued)}</p>
        )}
      </div>
    </article>
  )
}

export default function CertificateCard({
  certificate,
  variant = 'page',
}: {
  certificate: Certificate
  variant?: 'page' | 'home'
}) {
  if (variant === 'home') return <HomeCertificateCard certificate={certificate} />
  const title = certificate.shortName ?? certificate.name
  const showFull = !!certificate.shortName
  const topics = certCategoriesIn('topic', certificate.categories)
  const type = certCategoriesIn('type', certificate.categories)[0]
  return (
    <article className="surface-slate relative flex h-full flex-col gap-4 rounded-[10px] p-4 pb-5 shadow-[0_26px_36px_-18px_rgba(8,14,50,0.45)]">
      <div className="relative">
        <CertificateScan certificate={certificate} />
        {/* The scan panel is light in both themes, so the badge uses fixed ink and cream. */}
        {type && (
          <span className="absolute left-2.5 top-2.5 inline-flex min-h-[26px] items-center rounded-full bg-[#17161C] px-2.5 text-[13px] font-bold leading-none text-[#F4EEE3]">
            <span className="sr-only">Type: </span>
            {type}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 px-1">
        <h3 className="m-0 text-[21px] font-bold leading-[1.2] tracking-[-0.02em]">
          <Link
            to={`/certificates/${certificate.id}`}
            state={{ fromList: true }}
            data-cert-id={certificate.id}
            className="text-[var(--text)] no-underline after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </h3>
        {showFull && <p className="m-0 text-[14px] leading-[1.4] text-[var(--text-secondary)]">{certificate.name}</p>}
        <p className="m-0 text-[15px] font-medium leading-[1.4] text-[var(--text-secondary)]">{issuerLine(certificate)}</p>
        {certificate.issued && (
          <p className="m-0 text-[14px] font-semibold text-[var(--date)]">{formatMonth(certificate.issued)}</p>
        )}
        {topics.length > 0 && (
          <div className="pt-1">
            <CategoryPills label="Topics">
              {topics.map((t) => (
                <li key={t}>
                  <CategoryPill label={t} />
                </li>
              ))}
            </CategoryPills>
          </div>
        )}
      </div>
      {certificate.verifyUrl && (
        <div className="relative z-10 mt-auto self-start">
          <Button variant="secondary" href={certificate.verifyUrl} external label={verifyLabel(certificate.verifyType)} />
        </div>
      )}
    </article>
  )
}
