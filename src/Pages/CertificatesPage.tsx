import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Layout } from '../Components/Layout'
import CertificateCard from '../Components/CertificateCard'
import { CertificateDialog } from '../Components/CertificateDialog'
import { FilterButtons } from '../Components/FilterButtons'
import NotFoundPage from './NotFoundPage'
import { CERT_CATEGORIES, certificates, getCertificate } from '../content/certifications'
import { countWord } from '../content/count'

const SITE = 'John Rogee Turqueza'
const ALL = 'All'

export default function CertificatesPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const fromList = !!(location.state as { fromList?: boolean } | null)?.fromList
  const certificate = id ? getCertificate(id) : undefined
  const missing = !!id && !certificate
  const openedFromCard = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const lastId = useRef<string | undefined>(id)

  useEffect(() => {
    if (missing) return
    document.title = certificate
      ? `${certificate.shortName ?? certificate.name} · Certifications · ${SITE}`
      : `Certifications · ${SITE}`
  }, [certificate, missing])

  // After the dialog closes, return focus to the card that opened it, or to the h1 on a deep link.
  useEffect(() => {
    const was = lastId.current
    lastId.current = id
    if (!was || id) return
    const target = openedFromCard.current
      ? document.querySelector<HTMLElement>(`[data-cert-id="${was}"]`)
      : heading.current
    target?.focus()
  }, [id])

  const close = useCallback(() => {
    if (fromList) navigate(-1)
    else navigate('/certificates', { replace: true })
  }, [navigate, fromList])

  if (missing) return <NotFoundPage />

  const index = certificate ? certificates.indexOf(certificate) : -1

  // Fixed order from CERT_CATEGORIES; empty categories get no button.
  const categories: string[] = CERT_CATEGORIES.filter((c) => certificates.some((x) => x.category === c))
  const options = [
    { label: ALL, count: certificates.length },
    ...categories.map((c) => ({ label: c, count: certificates.filter((x) => x.category === c).length })),
  ]
  const wanted = params.get('category')
  const selected = wanted && categories.includes(wanted) ? wanted : ALL
  const shown = selected === ALL ? certificates : certificates.filter((x) => x.category === selected)
  const select = (label: string) => {
    navigate({ search: label === ALL ? '' : `?category=${encodeURIComponent(label)}` }, { replace: true })
  }

  return (
    <Layout surface="sub" current="certifications">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <section className="flex flex-col gap-3.5 pt-12 pb-9">
          <h1
            ref={heading}
            tabIndex={-1}
            className="m-0 text-[clamp(44px,5.5vw,68px)] font-bold leading-none tracking-[-0.035em] text-[var(--text)]"
          >
            Certifications
          </h1>
          <p className="m-0 text-[16px] text-[var(--text-secondary)] min-[760px]:text-[18px]">
            {countWord(certificates.length)} certifications. Each one links to its issuer.
          </p>
          <FilterButtons options={options} selected={selected} onSelect={select} label="Filter certifications" />
        </section>
        <section
          className="pb-[88px]"
          onClickCapture={(e) => {
            if ((e.target as HTMLElement).closest('[data-cert-id]')) openedFromCard.current = true
          }}
        >
          <div className="grid grid-cols-1 items-stretch gap-x-7 gap-y-10 min-[760px]:grid-cols-2 min-[1100px]:grid-cols-3">
            {shown.map((c) => (
              <CertificateCard key={c.id} certificate={c} />
            ))}
          </div>
        </section>
      </div>
      {certificate && (
        <CertificateDialog
          certificate={certificate}
          previous={certificates[index - 1]}
          next={certificates[index + 1]}
          onClose={close}
        />
      )}
    </Layout>
  )
}
