import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Certificate } from '../content/certifications'
import { verifyLabel } from '../content/certifications'
import { formatMonth } from '../content/dates'
import { Button } from './Button'
import { CertificateScan, issuerLine } from './CertificateCard'
import { Dialog } from './Dialog'
import { Icon } from './Icon'

const TITLE_ID = 'certificate-dialog-title'

function Row({ label, children }: { label: string; children: string }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-t border-[color-mix(in_srgb,var(--text)_16%,transparent)] py-3 min-[760px]:grid-cols-[110px_minmax(0,1fr)]">
      <dt className="text-[14px] text-[var(--text-secondary)]">{label}</dt>
      <dd className="m-0 text-[16px] font-semibold leading-[1.35]">{children}</dd>
    </div>
  )
}

type Props = {
  certificate: Certificate
  previous?: Certificate
  next?: Certificate
  onClose: () => void
}

export function CertificateDialog({ certificate, previous, next, onClose }: Props) {
  const title = useRef<HTMLHeadingElement>(null)
  const { state } = useLocation()
  useEffect(() => {
    title.current?.focus()
  }, [certificate.id])

  return (
    <Dialog open onClose={onClose} titleId={TITLE_ID}>
      <div className="absolute right-3 top-3">
        <Button variant="icon" leadingIcon="close" label="Close" onClick={onClose} />
      </div>
      <div className="grid gap-6 min-[760px]:grid-cols-[minmax(0,420px)_minmax(0,1fr)] min-[760px]:items-start min-[760px]:gap-8">
        <CertificateScan certificate={certificate} />
        <div className="flex flex-col gap-[18px] min-[760px]:pr-11">
          <h2
            id={TITLE_ID}
            ref={title}
            tabIndex={-1}
            className="m-0 pr-12 text-[28px] font-bold leading-[1.05] tracking-[-0.03em] min-[760px]:pr-0 min-[760px]:text-[34px]"
          >
            {certificate.shortName ?? certificate.name}
          </h2>
          <dl className="m-0">
            <Row label="Name">{certificate.name}</Row>
            <Row label="Issuer">{issuerLine(certificate)}</Row>
            {certificate.issued && <Row label="Issued">{formatMonth(certificate.issued)}</Row>}
            {certificate.verifyUrl && <Row label="Credential">Verified by issuer</Row>}
          </dl>
          {certificate.verifyUrl && (
            <div className="self-start">
              <Button variant="secondary" href={certificate.verifyUrl} external label={verifyLabel(certificate.verifyType)} />
            </div>
          )}
        </div>
      </div>
      {(previous || next) && (
        <nav
          aria-label="More certifications"
          className="mt-5 flex justify-between gap-4 border-t border-[color-mix(in_srgb,var(--text)_16%,transparent)] pt-4"
        >
          {previous ? (
            <Link to={`/certificates/${previous.id}`} replace state={state} className="flex min-h-11 flex-col gap-0.5 text-[var(--text)] no-underline hover:underline">
              <span className="inline-flex items-center gap-1.5 text-[14px] font-bold">
                <Icon name="arrow-left" size={16} /> Previous
              </span>
              <span className="text-[13px] text-[var(--text-secondary)]">{previous.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/certificates/${next.id}`} replace state={state} className="flex min-h-11 flex-col items-end gap-0.5 text-right text-[var(--text)] no-underline hover:underline">
              <span className="inline-flex items-center gap-1.5 text-[14px] font-bold">
                Next <Icon name="arrow" size={16} />
              </span>
              <span className="text-[13px] text-[var(--text-secondary)]">{next.name}</span>
            </Link>
          )}
        </nav>
      )}
    </Dialog>
  )
}
