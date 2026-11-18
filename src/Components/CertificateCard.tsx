import { Link } from 'react-router-dom'
import type { Certificate } from '../content/certifications'
import { verifyLabel } from '../content/certifications'
import { formatMonth } from '../content/dates'
import { Button } from './Button'
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

export function issuerLine(c: Certificate): string {
  return c.via ? `${c.issuer}, via ${c.via}` : c.issuer
}

export default function CertificateCard({
  certificate,
  variant = 'page',
}: {
  certificate: Certificate
  variant?: 'page' | 'home'
}) {
  const home = variant === 'home'
  const title = home ? certificate.name : (certificate.shortName ?? certificate.name)
  const showFull = !home && !!certificate.shortName
  return (
    <article
      className={`surface-slate relative flex h-full flex-col rounded-[10px] shadow-[0_26px_36px_-18px_rgba(8,14,50,0.45)] ${
        home ? 'gap-3 p-3 pb-4' : 'gap-4 p-4 pb-5'
      }`}
    >
      {!home && <CertificateScan certificate={certificate} />}
      <div className="flex flex-col gap-1.5 px-1">
        <h3 className={`m-0 font-bold leading-[1.2] tracking-[-0.02em] ${home ? 'text-[18px]' : 'text-[21px]'}`}>
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
      </div>
      {!home && certificate.verifyUrl && (
        <div className="relative z-10 mt-auto self-start">
          <Button variant="secondary" href={certificate.verifyUrl} external label={verifyLabel(certificate.verifyType)} />
        </div>
      )}
    </article>
  )
}
